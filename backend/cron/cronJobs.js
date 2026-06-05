const cron = require("node-cron");
const path = require("path");
const fs = require("fs");

// ======================================
// MODELS
// ======================================
const MonthLock = require("../models/MonthLock");
const MonthlyResetLog = require("../models/MonthlyResetLog");
const MealEntry = require("../models/MealEntry");
const Deposit = require("../models/Deposit");
const DailyBazaar = require("../models/DailyBazaar");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const FixedExpense = require("../models/FixedExpense");
const PdfReport = require("../models/PdfReport");
const User = require("../models/User");

// ======================================
// PDF GENERATORS
// ======================================
const {
  generateMonthlyPdf,
  generateDepositPdf,
  generateMealKhataPdf,
  generateMealGridPdf,
  generateBazaarLedgerPdf,
} = require("../utils/pdfGenerator");

// ======================================
// HELPER — get previous month info
// Called on the 1st of a new month to
// know which month to auto-reset
// ======================================
function getPreviousMonthInfo() {
  const now = new Date();
  // We are on the 1st of new month — previous month is month-1
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = prevDate.toLocaleString("default", { month: "long" });
  const year = prevDate.getFullYear();
  return { month, year };
}

// ======================================
// HELPER — get current month info
// Called on June 30 to lock June
// ======================================
function getCurrentMonthInfo() {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  return { month, year };
}

// ======================================
// AUTO PDF GENERATION
// Generates all 5 PDFs for given month
// Overwrites if already exists
// ======================================
async function generateAllPdfsForMonth(month, year) {
  const folderName = `${month}-${year}`;
  const folderPath = path.join(__dirname, "..", "uploads", "pdfs", folderName);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const results = [];

  // ── Helper: delete existing DB record + file ──
  async function clearExisting(reportType, fileName) {
    const existing = await PdfReport.findOne({ reportType, month, year });
    if (existing) {
      const oldPath = path.join(__dirname, "..", existing.pdfPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      await PdfReport.findByIdAndDelete(existing._id);
    }
    return path.join(folderPath, fileName);
  }

  // ── 1. MONTHLY CALCULATION PDF ──
  try {
    // Build monthly calculation data directly (no HTTP call)
    const axios = require("axios");
    const monthlyRes = await axios.get(
      "http://localhost:5000/api/monthly-calculation/current",
      { headers: { Authorization: "Bearer cron-internal" } },
    );
    const data = monthlyRes.data;

    const filePath = await clearExisting(
      "monthly-calculation",
      "monthly-calculation.pdf",
    );
    await generateMonthlyPdf({ filePath, data });

    await PdfReport.create({
      title: "Monthly Calculation",
      reportType: "monthly-calculation",
      month,
      year,
      folderName,
      pdfPath: `uploads/pdfs/${folderName}/monthly-calculation.pdf`,
      createdBy: null,
    });
    results.push({ pdf: "monthly-calculation", status: "ok" });
  } catch (err) {
    results.push({
      pdf: "monthly-calculation",
      status: "failed",
      error: err.message,
    });
  }

  // ── 2. DEPOSIT PDF ──
  try {
    const deposits = await Deposit.find({ month, year })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    if (deposits.length > 0) {
      const memberMap = {};
      deposits.forEach((d) => {
        const uid = d.user._id.toString();
        if (!memberMap[uid])
          memberMap[uid] = { name: d.user.name, deposits: [] };
        memberMap[uid].deposits.push({
          amount: d.amount,
          date: d.date,
          month: d.month,
          year: d.year,
        });
      });
      const members = Object.values(memberMap);

      const filePath = await clearExisting("deposit", "deposit-ledger.pdf");
      await generateDepositPdf({ filePath, data: { month, year, members } });

      await PdfReport.create({
        title: "Deposits",
        reportType: "deposit",
        month,
        year,
        folderName,
        pdfPath: `uploads/pdfs/${folderName}/deposit-ledger.pdf`,
        createdBy: null,
      });
      results.push({ pdf: "deposit-ledger", status: "ok" });
    } else {
      results.push({ pdf: "deposit-ledger", status: "skipped (no data)" });
    }
  } catch (err) {
    results.push({
      pdf: "deposit-ledger",
      status: "failed",
      error: err.message,
    });
  }

  // ── 3. MEAL KHATA PDF ──
  try {
    const users = await User.find({ approvalStatus: "approved" });
    const allEntries = await MealEntry.find({ month, year });

    const members = users.map((user) => {
      const userEntries = allEntries.filter(
        (e) => e.user.toString() === user._id.toString(),
      );
      const entries = {};
      userEntries.forEach((e) => {
        entries[e.date] = { lunch: e.lunch, dinner: e.dinner };
      });
      const totalLunch = userEntries.filter((e) => e.lunch).length;
      const totalDinner = userEntries.filter((e) => e.dinner).length;
      const totalMeals = totalLunch + totalDinner;
      return { name: user.name, entries, totalLunch, totalDinner, totalMeals };
    });
    const grandTotal = members.reduce((sum, m) => sum + m.totalMeals, 0);

    const filePath = await clearExisting("meal-khata", "daily-meal-khata.pdf");
    await generateMealKhataPdf({
      filePath,
      data: { month, year, members, grandTotal },
    });

    await PdfReport.create({
      title: "Daily Meal Khata",
      reportType: "meal-khata",
      month,
      year,
      folderName,
      pdfPath: `uploads/pdfs/${folderName}/daily-meal-khata.pdf`,
      createdBy: null,
    });
    results.push({ pdf: "meal-khata", status: "ok" });
  } catch (err) {
    results.push({ pdf: "meal-khata", status: "failed", error: err.message });
  }

  // ── 4. MEAL GRID PDF ──
  try {
    const users = await User.find({ approvalStatus: "approved" });
    const allEntries = await MealEntry.find({ month, year });

    const members = users.map((user) => {
      const userEntries = allEntries.filter(
        (e) => e.user.toString() === user._id.toString(),
      );
      const entries = {};
      userEntries.forEach((e) => {
        entries[e.date] = { lunch: e.lunch, dinner: e.dinner };
      });
      const totalMeals = userEntries.reduce((sum, e) => sum + e.totalMeal, 0);
      return { name: user.name, entries, totalMeals };
    });

    const filePath = await clearExisting("meal-grid", "meal-grid.pdf");
    await generateMealGridPdf({ filePath, data: { month, year, members } });

    await PdfReport.create({
      title: "Meal Grid",
      reportType: "meal-grid",
      month,
      year,
      folderName,
      pdfPath: `uploads/pdfs/${folderName}/meal-grid.pdf`,
      createdBy: null,
    });
    results.push({ pdf: "meal-grid", status: "ok" });
  } catch (err) {
    results.push({ pdf: "meal-grid", status: "failed", error: err.message });
  }

  // ── 5. BAZAAR LEDGER PDF ──
  try {
    const bazaarList = await DailyBazaar.find({ month, year })
      .populate("bazaarBy", "name")
      .sort({ date: 1 });

    if (bazaarList.length > 0) {
      const entries = bazaarList.map((b) => ({
        date: b.date,
        mealType: b.mealType,
        bazaarBy: b.bazaarBy?.name || "Unknown",
        items: b.items,
        totalCost: b.totalCost,
      }));

      const filePath = await clearExisting(
        "bazaar-ledger",
        "bazaar-ledger.pdf",
      );
      await generateBazaarLedgerPdf({
        filePath,
        data: { month, year, entries },
      });

      await PdfReport.create({
        title: "Bazaar Ledger",
        reportType: "bazaar-ledger",
        month,
        year,
        folderName,
        pdfPath: `uploads/pdfs/${folderName}/bazaar-ledger.pdf`,
        createdBy: null,
      });
      results.push({ pdf: "bazaar-ledger", status: "ok" });
    } else {
      results.push({ pdf: "bazaar-ledger", status: "skipped (no data)" });
    }
  } catch (err) {
    results.push({
      pdf: "bazaar-ledger",
      status: "failed",
      error: err.message,
    });
  }

  return results;
}

// ======================================
// AUTO RESET FUNCTION
// Deletes all mess data for given month
// ======================================
async function performAutoReset(month, year) {
  const numYear = Number(year);

  const counts = {
    mealEntries: await MealEntry.countDocuments({ month, year: numYear }),
    deposits: await Deposit.countDocuments({ month, year: numYear }),
    bazaarEntries: await DailyBazaar.countDocuments({ month, year: numYear }),
    riceExpenses: await RiceExpense.countDocuments({ month, year: numYear }),
    gasExpenses: await GasExpense.countDocuments({ month, year: numYear }),
    guestMeals: await GuestMeal.countDocuments({ month, year: numYear }),
    fixedExpenses: await FixedExpense.countDocuments({ month, year: numYear }),
  };

  await Promise.all([
    MealEntry.deleteMany({ month, year: numYear }),
    Deposit.deleteMany({ month, year: numYear }),
    DailyBazaar.deleteMany({ month, year: numYear }),
    RiceExpense.deleteMany({ month, year: numYear }),
    GasExpense.deleteMany({ month, year: numYear }),
    GuestMeal.deleteMany({ month, year: numYear }),
    FixedExpense.deleteMany({ month, year: numYear }),
  ]);

  await MonthlyResetLog.create({
    month,
    year: numYear,
    resetBy: null, // system-triggered
    deletedCounts: counts,
  });

  return counts;
}

// ======================================
// CRON JOB 1 — LOCK
// Fires at 6:00 PM on the last day of
// every month (day 28, 29, 30, 31)
// We check if tomorrow is the 1st
// ======================================
function startLockCron() {
  // Runs at 18:00 every day — checks if today is last day of month
  cron.schedule("0 18 * * *", async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      // If tomorrow is the 1st — today is the last day of the month
      if (tomorrow.getDate() !== 1) return;

      const { month, year } = getCurrentMonthInfo();

      // Upsert lock document
      await MonthLock.findOneAndUpdate(
        { month, year },
        { isLocked: true, lockedAt: new Date() },
        { upsert: true, new: true },
      );

      console.log(`[CRON LOCK] Month locked: ${month} ${year} at 6:00 PM`);
    } catch (err) {
      console.error("[CRON LOCK ERROR]", err);
    }
  });
}

// ======================================
// CRON JOB 2 — AUTO PDF + RESET
// Fires at 11:00 PM on the 1st of every
// month — generates PDFs for prev month,
// then resets prev month data,
// then unlocks
// ======================================
function startAutoResetCron() {
  // Runs at 23:00 on day 1 of every month
  cron.schedule("0 23 1 * *", async () => {
    try {
      const { month, year } = getPreviousMonthInfo();

      console.log(
        `[CRON AUTO-RESET] Starting auto process for ${month} ${year}`,
      );

      // ── STEP 1: Check if admin already manually reset ──
      const existingLog = await MonthlyResetLog.findOne({ month, year });
      const lockDoc = await MonthLock.findOne({ month, year });

      if (existingLog && lockDoc && !lockDoc.isLocked) {
        // Admin already handled it — nothing to do
        console.log(
          `[CRON AUTO-RESET] Admin already reset ${month} ${year}. Skipping.`,
        );
        return;
      }

      // ── STEP 2: Generate all 5 PDFs ──
      console.log(`[CRON AUTO-RESET] Generating PDFs for ${month} ${year}...`);
      const pdfResults = await generateAllPdfsForMonth(month, year);
      console.log("[CRON AUTO-RESET] PDF results:", pdfResults);

      // ── STEP 3: Auto reset ──
      console.log(`[CRON AUTO-RESET] Deleting ${month} ${year} data...`);
      const counts = await performAutoReset(month, year);
      console.log("[CRON AUTO-RESET] Deleted counts:", counts);

      // ── STEP 4: Unlock ──
      await MonthLock.findOneAndUpdate(
        { month, year },
        {
          isLocked: false,
          autoResetScheduled: true,
          autoResetDoneAt: new Date(),
        },
        { upsert: true, new: true },
      );

      console.log(
        `[CRON AUTO-RESET] Complete. ${month} ${year} unlocked and reset.`,
      );
    } catch (err) {
      console.error("[CRON AUTO-RESET ERROR]", err);
    }
  });
}

// ======================================
// EXPORT — call this once from index.js
// ======================================
function startAllCronJobs() {
  startLockCron();
  startAutoResetCron();
  console.log(
    "[CRON] Lock cron (6PM last day) and Auto-reset cron (11PM 1st) started.",
  );
}

module.exports = { startAllCronJobs };
