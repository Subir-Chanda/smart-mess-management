const MealEntry = require("../models/MealEntry");
const Deposit = require("../models/Deposit");
const DailyBazaar = require("../models/DailyBazaar");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const FixedExpense = require("../models/FixedExpense");
const MonthlyResetLog = require("../models/MonthlyResetLog");
const PdfReport = require("../models/PdfReport");

function getMonthOptions() {
  const now = new Date();
  const currentMonth = now.toLocaleString("default", { month: "long" });
  const currentYear = now.getFullYear();
  const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonth = nextDate.toLocaleString("default", { month: "long" });
  const nextYear = nextDate.getFullYear();
  return { currentMonth, currentYear, nextMonth, nextYear };
}

const REQUIRED_PDF_TYPES = [
  { type: "monthly-calculation", label: "Monthly Calculation" },
  { type: "deposit", label: "Deposit Ledger" },
  { type: "meal-khata", label: "Daily Meal Khata" },
  { type: "meal-grid", label: "Meal Grid" },
  { type: "bazaar-ledger", label: "Bazaar Ledger" },
];

async function checkPdfsGenerated(month, year, messId) {
  const missingPdfs = [];
  for (const pdf of REQUIRED_PDF_TYPES) {
    const exists = await PdfReport.findOne({
      reportType: pdf.type,
      month,
      year,
      messId,
    });
    if (!exists) missingPdfs.push(pdf.label);
  }
  return { allGenerated: missingPdfs.length === 0, missingPdfs };
}

exports.getResetStatus = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { currentMonth, currentYear, nextMonth, nextYear } =
      getMonthOptions();

    const lastReset = await MonthlyResetLog.findOne({ messId })
      .populate("resetBy", "name email")
      .sort({ createdAt: -1 });

    const pdfCheck = await checkPdfsGenerated(
      currentMonth,
      currentYear,
      messId,
    );

    res.status(200).json({
      success: true,
      currentMonth,
      currentYear,
      nextMonth,
      nextYear,
      lastReset: lastReset || null,
      currentMonthPdfStatus: pdfCheck,
    });
  } catch (error) {
    console.error("getResetStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.checkMonthPdfStatus = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { month, year } = req.query;

    if (!month || !year)
      return res
        .status(400)
        .json({
          success: false,
          message: "month and year query params required",
        });

    const pdfCheck = await checkPdfsGenerated(month, Number(year), messId);
    res
      .status(200)
      .json({ success: true, month, year: Number(year), ...pdfCheck });
  } catch (error) {
    console.error("checkMonthPdfStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.performMonthlyReset = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { month, year, force } = req.body;

    if (!month || !year)
      return res
        .status(400)
        .json({ success: false, message: "Month and year are required." });

    const numYear = Number(year);
    const { currentMonth, currentYear, nextMonth, nextYear } =
      getMonthOptions();
    const isCurrentMonth = month === currentMonth && numYear === currentYear;
    const isNextMonth = month === nextMonth && numYear === nextYear;

    if (!isCurrentMonth && !isNextMonth) {
      return res.status(400).json({
        success: false,
        message: `Invalid selection. You can only reset ${currentMonth} ${currentYear} or ${nextMonth} ${nextYear}.`,
      });
    }

    if (isCurrentMonth && !force) {
      const pdfCheck = await checkPdfsGenerated(month, numYear, messId);
      if (!pdfCheck.allGenerated) {
        return res.status(403).json({
          success: false,
          pdfBlocked: true,
          message: `Cannot reset ${month} ${numYear} — the following PDFs have not been generated yet:`,
          missingPdfs: pdfCheck.missingPdfs,
        });
      }
    }

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

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

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
      resetBy: req.user?.id || req.user?._id,
      deletedCounts: counts,
      messId,
    });

    res.status(200).json({
      success: true,
      message: `Reset complete. ${month} ${numYear} is now fresh and ready.`,
      selectedMonth: month,
      selectedYear: numYear,
      deletedCounts: counts,
      totalRecords,
    });
  } catch (error) {
    console.error("performMonthlyReset error:", error);
    res
      .status(500)
      .json({ success: false, message: "Reset failed. No data was changed." });
  }
};

exports.getResetHistory = async (req, res) => {
  try {
    const messId = req.user.messId;
    const logs = await MonthlyResetLog.find({ messId })
      .populate("resetBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("getResetHistory error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
