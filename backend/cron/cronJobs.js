const cron = require("node-cron");
const mongoose = require("mongoose");

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
const MashiCost = require("../models/MashiCost");
const GuestMealRate = require("../models/GuestMealRate");

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
// ImageKit
// ======================================
const imagekit = require("../config/imagekit");

// ======================================
// HELPER — Upload buffer to ImageKit
// ======================================
async function uploadToImageKit(pdfBuffer, fileName, messId, folderName) {
  const base64File = pdfBuffer.toString("base64");
  const uploadResponse = await imagekit.upload({
    file: base64File,
    fileName: fileName,
    folder: `/pdfs/${messId}/${folderName}/`,
    useUniqueFileName: true,
  });
  return { fileUrl: uploadResponse.url, fileId: uploadResponse.fileId };
}

// ======================================
// HELPER — Delete file from ImageKit
// ======================================
async function deleteFromImageKit(fileId) {
  try {
    if (fileId) await imagekit.deleteFile(fileId);
  } catch (err) {
    console.log("ImageKit delete failed (ignored):", err.message);
  }
}

// ======================================
// HELPER — get previous month info
// ======================================
function getPreviousMonthInfo() {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = prevDate.toLocaleString("default", { month: "long" });
  const year = prevDate.getFullYear();
  return { month, year };
}

// ======================================
// HELPER — get current month info
// ======================================
function getCurrentMonthInfo() {
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  return { month, year };
}

// ======================================
// HELPER — getRateForCategory
// (same logic as pdfController)
// ======================================
function getRateForCategory(category, guestRate) {
  if (!guestRate) return 0;
  switch (category) {
    case "Sobji":
      return guestRate.sobji || 0;
    case "Fish":
      return guestRate.fish || 0;
    case "Egg":
      return guestRate.egg || 0;
    case "Chicken":
      return guestRate.chicken || 0;
    case "Grand Meal":
      return guestRate.grandMeal || 0;
    default:
      return 0;
  }
}

// ======================================
// GENERATE ALL PDFs FOR ONE MESS
// Mirrors pdfController logic exactly
// ======================================
async function generateAllPdfsForMess(messId, month, year) {
  const messObjectId = new mongoose.Types.ObjectId(messId);
  const folderName = `${month}-${year}`;
  const results = [];

  // ── Helper: delete existing DB record + ImageKit file ──
  async function clearExisting(reportType) {
    const existing = await PdfReport.findOne({
      reportType,
      month,
      year,
      messId,
    });
    if (existing) {
      await deleteFromImageKit(existing.fileId);
      await PdfReport.findByIdAndDelete(existing._id);
    }
  }

  // ── 1. MONTHLY CALCULATION PDF ──
  try {
    const users = await User.find({ approvalStatus: "approved", messId });

    const bazaarData = await DailyBazaar.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);
    const totalBazaarCost = bazaarData[0]?.total || 0;

    const riceData = await RiceExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalRiceCost = riceData[0]?.total || 0;

    const gasData = await GasExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalGasCost = gasData[0]?.total || 0;

    const guestData = await GuestMeal.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);
    const totalGuestCost = guestData[0]?.total || 0;

    const fixedData = await FixedExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalFixedCost = fixedData[0]?.total || 0;

    const latestMashi = await MashiCost.findOne({ messId }).sort({
      createdAt: -1,
    });
    const rannaRate = latestMashi?.rannaMashiCost || 0;
    const kajerRate = latestMashi?.kajerMashiCost || 0;

    const guestRate = await GuestMealRate.findOne({ messId }).sort({
      createdAt: -1,
    });

    let eligibleMeals = 0;
    let totalLowMealRecovery = 0;
    const memberRows = [];

    for (const user of users) {
      const mealData = await MealEntry.aggregate([
        { $match: { user: user._id, month, year, messId: messObjectId } },
        { $group: { _id: null, meals: { $sum: "$totalMeal" } } },
      ]);
      const mealCount = mealData[0]?.meals || 0;

      if (mealCount > 0 && mealCount <= 10) {
        const mealEntries = await MealEntry.find({
          user: user._id,
          month,
          year,
          messId,
        });
        let memberGuestCost = 0;
        for (const meal of mealEntries) {
          for (const mealType of ["Lunch", "Dinner"]) {
            if (
              (mealType === "Lunch" && meal.lunch) ||
              (mealType === "Dinner" && meal.dinner)
            ) {
              const bazaarEntry = await DailyBazaar.findOne({
                date: meal.date,
                month,
                year,
                mealType,
                messId,
              });
              if (bazaarEntry)
                memberGuestCost += getRateForCategory(
                  bazaarEntry.foodCategory,
                  guestRate,
                );
            }
          }
        }
        totalLowMealRecovery += memberGuestCost;
      }

      if (mealCount >= 30) eligibleMeals += mealCount;
      else if (mealCount >= 11) eligibleMeals += 30;

      memberRows.push({ user, mealCount });
    }

    const finalBazaarCost =
      totalBazaarCost +
      totalRiceCost +
      totalGasCost -
      totalGuestCost -
      totalLowMealRecovery;
    const mealRate =
      eligibleMeals > 0 ? (finalBazaarCost / eligibleMeals).toFixed(2) : 0;
    const fixedCostPerMember =
      users.length > 0 ? (totalFixedCost / users.length).toFixed(2) : 0;

    const finalRows = [];
    let totalDueAmount = 0;
    let totalMashiCost = 0;

    for (const row of memberRows) {
      const user = row.user;
      const mealCount = row.mealCount;

      const depositData = await Deposit.aggregate([
        { $match: { user: user._id, month, year, messId: messObjectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const deposit = depositData[0]?.total || 0;

      const memberGuestData = await GuestMeal.aggregate([
        { $match: { member: user._id, month, year, messId: messObjectId } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } },
      ]);
      const guestCost = memberGuestData[0]?.total || 0;

      let mealCost = 0;
      if (mealCount >= 30) {
        mealCost = mealCount * Number(mealRate);
      } else if (mealCount >= 11) {
        mealCost = 30 * Number(mealRate);
      } else if (mealCount > 0 && mealCount <= 10) {
        const mealEntries = await MealEntry.find({
          user: user._id,
          month,
          year,
          messId,
        });
        let lowMealCost = 0;
        for (const meal of mealEntries) {
          for (const mealType of ["Lunch", "Dinner"]) {
            if (
              (mealType === "Lunch" && meal.lunch) ||
              (mealType === "Dinner" && meal.dinner)
            ) {
              const bazaarEntry = await DailyBazaar.findOne({
                date: meal.date,
                month,
                year,
                mealType,
                messId,
              });
              if (bazaarEntry)
                lowMealCost += getRateForCategory(
                  bazaarEntry.foodCategory,
                  guestRate,
                );
            }
          }
        }
        mealCost = lowMealCost;
      }

      let rannaCost = 0;
      const kajerCostVal = Number(kajerRate);
      if (user.monthlyMealStatus === "ON") rannaCost = Number(rannaRate);

      totalMashiCost += rannaCost + kajerCostVal;

      const totalCost =
        mealCost +
        guestCost +
        rannaCost +
        kajerCostVal +
        Number(fixedCostPerMember);
      const due = totalCost - deposit;
      totalDueAmount += due;

      let billableMeals = mealCount;
      if (mealCount >= 11 && mealCount <= 29) billableMeals = 30;

      finalRows.push({
        name: user.name,
        monthlyMealStatus: user.monthlyMealStatus,
        billingType:
          mealCount <= 10
            ? "Guest"
            : mealCount <= 29
              ? "30 Meal Rule"
              : "Normal",
        deposit,
        mealCount,
        billableMeals,
        mealCost: mealCost.toFixed(2),
        guestCost,
        rannaCost,
        kajerCost: kajerCostVal,
        fixedCost: fixedCostPerMember,
        totalCost: totalCost.toFixed(2),
        due: due.toFixed(2),
      });
    }

    const allDepositData = await Deposit.aggregate([
      { $match: { messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalDeposits = allDepositData[0]?.total || 0;
    const currentMessFundBalance =
      totalDeposits - (totalBazaarCost + totalFixedCost);
    const totalGuestRecovery = totalGuestCost + totalLowMealRecovery;
    const dueToPaid = totalMashiCost + totalRiceCost + totalGasCost;

    const data = {
      month,
      year,
      mealRate,
      eligibleMeals,
      totalBazaarCost,
      totalRiceCost,
      totalGasCost,
      totalGuestCost,
      totalGuestRecovery,
      totalFixedCost,
      rannaRate,
      kajerRate,
      rows: Array.isArray(finalRows) ? finalRows : [],
      fixedCostPerMember,
      currentMessFundBalance,
      totalDueAmount,
      totalMashiCost,
      dueToPaid,
      difference:
        totalDueAmount +
        currentMessFundBalance -
        (totalMashiCost + totalRiceCost + totalGasCost),
    };

    await clearExisting("monthly-calculation");
    const pdfBuffer = await generateMonthlyPdf({ data });
    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "monthly-calculation.pdf",
      messId,
      folderName,
    );
    await PdfReport.create({
      title: "Monthly Calculation",
      reportType: "monthly-calculation",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: null,
      messId,
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
    const deposits = await Deposit.find({ month, year, messId })
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

      await clearExisting("deposit");
      const pdfBuffer = await generateDepositPdf({
        data: { month, year, members: Object.values(memberMap) },
      });
      const { fileUrl, fileId } = await uploadToImageKit(
        pdfBuffer,
        "deposit-ledger.pdf",
        messId,
        folderName,
      );
      await PdfReport.create({
        title: "Deposits",
        reportType: "deposit",
        month,
        year,
        folderName,
        fileUrl,
        fileId,
        createdBy: null,
        messId,
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
    const users = await User.find({ approvalStatus: "approved", messId });
    const allEntries = await MealEntry.find({ month, year, messId });

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
      return {
        name: user.name,
        entries,
        totalLunch,
        totalDinner,
        totalMeals: totalLunch + totalDinner,
      };
    });
    const grandTotal = members.reduce((sum, m) => sum + m.totalMeals, 0);

    await clearExisting("meal-khata");
    const pdfBuffer = await generateMealKhataPdf({
      data: { month, year, members, grandTotal },
    });
    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "daily-meal-khata.pdf",
      messId,
      folderName,
    );
    await PdfReport.create({
      title: "Daily Meal Khata",
      reportType: "meal-khata",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: null,
      messId,
    });
    results.push({ pdf: "meal-khata", status: "ok" });
  } catch (err) {
    results.push({ pdf: "meal-khata", status: "failed", error: err.message });
  }

  // ── 4. MEAL GRID PDF ──
  try {
    const users = await User.find({ approvalStatus: "approved", messId });
    const allEntries = await MealEntry.find({ month, year, messId });

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

    await clearExisting("meal-grid");
    const pdfBuffer = await generateMealGridPdf({
      data: { month, year, members },
    });
    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "meal-grid.pdf",
      messId,
      folderName,
    );
    await PdfReport.create({
      title: "Meal Grid",
      reportType: "meal-grid",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: null,
      messId,
    });
    results.push({ pdf: "meal-grid", status: "ok" });
  } catch (err) {
    results.push({ pdf: "meal-grid", status: "failed", error: err.message });
  }

  // ── 5. BAZAAR LEDGER PDF ──
  try {
    const bazaarList = await DailyBazaar.find({ month, year, messId })
      .populate("bazaarBy", "name")
      .sort({ date: 1 });

    if (bazaarList.length > 0) {
      const entries = bazaarList.map((b) => ({
        date: b.date,
        mealType: b.mealType,
        bazaarBy: b.bazaarBy?.name || "Unknown",
        items: b.items.map((item) => ({
          itemName: item.itemName,
          price: item.price,
        })),
        totalCost: b.totalCost,
      }));

      await clearExisting("bazaar-ledger");
      const pdfBuffer = await generateBazaarLedgerPdf({
        data: { month, year, entries },
      });
      const { fileUrl, fileId } = await uploadToImageKit(
        pdfBuffer,
        "bazaar-ledger.pdf",
        messId,
        folderName,
      );
      await PdfReport.create({
        title: "Bazaar Ledger",
        reportType: "bazaar-ledger",
        month,
        year,
        folderName,
        fileUrl,
        fileId,
        createdBy: null,
        messId,
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
// ======================================
async function performAutoReset(messId, month, year) {
  const numYear = Number(year);

  const counts = {
    mealEntries: await MealEntry.countDocuments({
      month,
      year: numYear,
      messId,
    }),
    deposits: await Deposit.countDocuments({ month, year: numYear, messId }),
    bazaarEntries: await DailyBazaar.countDocuments({
      month,
      year: numYear,
      messId,
    }),
    riceExpenses: await RiceExpense.countDocuments({
      month,
      year: numYear,
      messId,
    }),
    gasExpenses: await GasExpense.countDocuments({
      month,
      year: numYear,
      messId,
    }),
    guestMeals: await GuestMeal.countDocuments({
      month,
      year: numYear,
      messId,
    }),
    fixedExpenses: await FixedExpense.countDocuments({
      month,
      year: numYear,
      messId,
    }),
  };

  await Promise.all([
    MealEntry.deleteMany({ month, year: numYear, messId }),
    Deposit.deleteMany({ month, year: numYear, messId }),
    DailyBazaar.deleteMany({ month, year: numYear, messId }),
    RiceExpense.deleteMany({ month, year: numYear, messId }),
    GasExpense.deleteMany({ month, year: numYear, messId }),
    GuestMeal.deleteMany({ month, year: numYear, messId }),
    FixedExpense.deleteMany({ month, year: numYear, messId }),
  ]);

  await MonthlyResetLog.create({
    month,
    year: numYear,
    messId,
    resetBy: null,
    deletedCounts: counts,
  });

  return counts;
}

// ======================================
// CRON JOB 1 — LOCK (6PM last day)
// ======================================
function startLockCron() {
  cron.schedule("0 18 * * *", async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      if (tomorrow.getDate() !== 1) return;

      const { month, year } = getCurrentMonthInfo();

      // Lock all messes
      const allMessIds = await User.distinct("messId", {
        approvalStatus: "approved",
      });
      for (const messId of allMessIds) {
        await MonthLock.findOneAndUpdate(
          { month, year, messId },
          { isLocked: true, lockedAt: new Date() },
          { upsert: true, new: true },
        );
      }
      console.log(`[CRON LOCK] All messes locked for ${month} ${year}`);
    } catch (err) {
      console.error("[CRON LOCK ERROR]", err);
    }
  });
}

// ======================================
// CRON JOB 2 — AUTO PDF + RESET (11PM 1st)
// ======================================
function startAutoResetCron() {
  cron.schedule("0 23 1 * *", async () => {
    try {
      const { month, year } = getPreviousMonthInfo();
      console.log(`[CRON AUTO-RESET] Starting for ${month} ${year}`);

      // Get all unique messIds that have data for this month
      const allMessIds = await User.distinct("messId", {
        approvalStatus: "approved",
      });

      for (const messId of allMessIds) {
        try {
          const existingLog = await MonthlyResetLog.findOne({
            month,
            year,
            messId,
          });
          const lockDoc = await MonthLock.findOne({ month, year, messId });

          if (existingLog && lockDoc && !lockDoc.isLocked) {
            console.log(
              `[CRON AUTO-RESET] Admin already reset messId ${messId} for ${month} ${year}. Skipping.`,
            );
            continue;
          }

          console.log(
            `[CRON AUTO-RESET] Generating PDFs for messId ${messId}...`,
          );
          const pdfResults = await generateAllPdfsForMess(messId, month, year);
          console.log(
            `[CRON AUTO-RESET] PDFs for messId ${messId}:`,
            pdfResults,
          );

          console.log(
            `[CRON AUTO-RESET] Resetting data for messId ${messId}...`,
          );
          const counts = await performAutoReset(messId, month, year);
          console.log(
            `[CRON AUTO-RESET] Reset counts for messId ${messId}:`,
            counts,
          );

          await MonthLock.findOneAndUpdate(
            { month, year, messId },
            {
              isLocked: false,
              autoResetScheduled: true,
              autoResetDoneAt: new Date(),
            },
            { upsert: true, new: true },
          );
          console.log(`[CRON AUTO-RESET] Done for messId ${messId}`);
        } catch (messErr) {
          console.error(`[CRON AUTO-RESET ERROR] messId ${messId}:`, messErr);
        }
      }

      console.log(
        `[CRON AUTO-RESET] Complete for all messes. ${month} ${year}`,
      );
    } catch (err) {
      console.error("[CRON AUTO-RESET ERROR]", err);
    }
  });
}

// ======================================
// EXPORT
// ======================================
function startAllCronJobs() {
  startLockCron();
  startAutoResetCron();
  console.log(
    "[CRON] Lock cron (6PM last day) and Auto-reset cron (11PM 1st) started.",
  );
}

module.exports = { startAllCronJobs };
