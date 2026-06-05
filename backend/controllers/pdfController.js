const PdfReport = require("../models/PdfReport");
const imagekit = require("../config/imagekit");
const MealEntry = require("../models/MealEntry");
const User = require("../models/User");
const DailyBazaar = require("../models/DailyBazaar");
const {
  generateMonthlyPdf,
  generateDepositPdf,
  generateMealKhataPdf,
  generateMealGridPdf,
  generateBazaarLedgerPdf,
} = require("../utils/pdfGenerator");
const Deposit = require("../models/Deposit");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const FixedExpense = require("../models/FixedExpense");
const MashiCost = require("../models/MashiCost");
const GuestMealRate = require("../models/GuestMealRate");
const mongoose = require("mongoose");

// ======================================
// HELPER: Upload PDF buffer to ImageKit
// ======================================

async function uploadToImageKit(pdfBuffer, fileName, messId, folderName) {
  // ImageKit requires base64 string, not a raw Buffer
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
// HELPER: Delete file from ImageKit
// ======================================

async function deleteFromImageKit(fileId) {
  try {
    if (fileId) await imagekit.deleteFile(fileId);
  } catch (err) {
    console.log("ImageKit delete failed (ignored):", err.message);
  }
}

// ======================================
// GET FOLDERS
// ======================================

exports.getFolders = async (req, res) => {
  try {
    const messId = req.user.messId;
    const messObjectId = new mongoose.Types.ObjectId(messId);
    const folders = await PdfReport.aggregate([
      { $match: { messId: messObjectId } },
      { $group: { _id: "$folderName" } },
      { $project: { _id: 0, folderName: "$_id" } },
      { $sort: { folderName: -1 } },
    ]);
    res.status(200).json({ success: true, folders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Load Folders" });
  }
};

// ======================================
// GET REPORTS BY FOLDER
// ======================================

exports.getReportsByFolder = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { folderName } = req.params;
    const reports = await PdfReport.find({ folderName, messId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, reports });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Load Reports" });
  }
};

// ======================================
// DELETE REPORT
// ======================================

exports.deleteReport = async (req, res) => {
  try {
    const report = await PdfReport.findById(req.params.id);
    if (!report)
      return res
        .status(404)
        .json({ success: false, message: "Report Not Found" });

    // Delete from ImageKit
    await deleteFromImageKit(report.fileId);

    await PdfReport.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "PDF Deleted Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Delete Failed" });
  }
};

// ======================================
// DOWNLOAD PDF
// ======================================

exports.downloadPdf = async (req, res) => {
  try {
    const report = await PdfReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ success: false, message: "PDF Not Found" });

    if (!report.fileUrl)
      return res
        .status(404)
        .json({ success: false, message: "File URL Missing" });

    // Redirect browser to the ImageKit URL — browser will download it
    res.redirect(report.fileUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Download Failed" });
  }
};

// ======================================
// GENERATE MONTHLY PDF
// ======================================

exports.generateMonthlyPdfReport = async (req, res) => {
  try {
    const messId = req.user.messId;
    const messObjectId = new mongoose.Types.ObjectId(messId);

    // ── Compute monthly data directly (no internal axios call) ──
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

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
      success: true,
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
      rows: finalRows,
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
    // ── End of monthly data computation ──

    const folderName = `${month}-${year}`;

    const existingReport = await PdfReport.findOne({
      reportType: "monthly-calculation",
      month,
      year,
      messId,
    });
    const replace = req.query.replace === "true";

    if (existingReport && !replace) {
      return res.status(409).json({
        success: false,
        exists: true,
        message: `PDF already exists for ${month} ${year}`,
        reportId: existingReport._id,
      });
    }
    if (existingReport && replace) {
      await deleteFromImageKit(existingReport.fileId);
      await PdfReport.findByIdAndDelete(existingReport._id);
    }

    const pdfBuffer = await generateMonthlyPdf({ data });

    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "monthly-calculation.pdf",
      messId,
      folderName,
    );

    const report = await PdfReport.create({
      title: "Monthly Calculation",
      reportType: "monthly-calculation",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Generate PDF" });
  }
};

// ======================================
// GENERATE DEPOSIT PDF
// ======================================

exports.generateDepositPdfReport = async (req, res) => {
  try {
    const messId = req.user.messId;
    const deposits = await Deposit.find({ messId })
      .populate("user", "name")
      .sort({ createdAt: 1 });

    if (deposits.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "No Deposit Found" });

    const month = deposits[0].month;
    const year = deposits[0].year;
    const folderName = `${month}-${year}`;

    const existingReport = await PdfReport.findOne({
      reportType: "deposit",
      month,
      year,
      messId,
    });
    const replace = req.query.replace === "true";

    if (existingReport && !replace)
      return res.status(409).json({
        success: false,
        exists: true,
        message: `Deposit PDF already exists for ${month} ${year}`,
      });

    if (existingReport && replace) {
      await deleteFromImageKit(existingReport.fileId);
      await PdfReport.findByIdAndDelete(existingReport._id);
    }

    const memberMap = {};
    deposits.forEach((deposit) => {
      const userId = deposit.user._id.toString();
      if (!memberMap[userId])
        memberMap[userId] = { name: deposit.user.name, deposits: [] };
      memberMap[userId].deposits.push({
        amount: deposit.amount,
        date: deposit.date,
        month: deposit.month,
        year: deposit.year,
      });
    });

    const pdfBuffer = await generateDepositPdf({
      data: { month, year, members: Object.values(memberMap) },
    });

    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "deposit-ledger.pdf",
      messId,
      folderName,
    );

    const report = await PdfReport.create({
      title: "Deposits",
      reportType: "deposit",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Generate Deposit PDF" });
  }
};

// ======================================
// GENERATE MEAL KHATA PDF
// ======================================

exports.generateMealKhataPdfReport = async (req, res) => {
  try {
    const messId = req.user.messId;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    const folderName = `${month}-${year}`;

    const existingReport = await PdfReport.findOne({
      reportType: "meal-khata",
      month,
      year,
      messId,
    });
    const replace = req.query.replace === "true";

    if (existingReport && !replace)
      return res.status(409).json({
        success: false,
        exists: true,
        message: `Meal Khata PDF already exists for ${month} ${year}`,
        reportId: existingReport._id,
      });

    if (existingReport && replace) {
      await deleteFromImageKit(existingReport.fileId);
      await PdfReport.findByIdAndDelete(existingReport._id);
    }

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

    const pdfBuffer = await generateMealKhataPdf({
      data: { month, year, members, grandTotal },
    });

    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "daily-meal-khata.pdf",
      messId,
      folderName,
    );

    const report = await PdfReport.create({
      title: "Daily Meal Khata",
      reportType: "meal-khata",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Generate Meal Khata PDF" });
  }
};

// ======================================
// GENERATE MEAL GRID PDF
// ======================================

exports.generateMealGridPdfReport = async (req, res) => {
  try {
    const messId = req.user.messId;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    const folderName = `${month}-${year}`;

    const existingReport = await PdfReport.findOne({
      reportType: "meal-grid",
      month,
      year,
      messId,
    });
    const replace = req.query.replace === "true";

    if (existingReport && !replace)
      return res.status(409).json({
        success: false,
        exists: true,
        message: `Meal Grid PDF already exists for ${month} ${year}`,
        reportId: existingReport._id,
      });

    if (existingReport && replace) {
      await deleteFromImageKit(existingReport.fileId);
      await PdfReport.findByIdAndDelete(existingReport._id);
    }

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

    const pdfBuffer = await generateMealGridPdf({
      data: { month, year, members },
    });

    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "meal-grid.pdf",
      messId,
      folderName,
    );

    const report = await PdfReport.create({
      title: "Meal Grid",
      reportType: "meal-grid",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Generate Meal Grid PDF" });
  }
};

// ======================================
// GENERATE BAZAAR LEDGER PDF
// ======================================

exports.generateBazaarLedgerPdfReport = async (req, res) => {
  try {
    const messId = req.user.messId;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();
    const folderName = `${month}-${year}`;

    const existingReport = await PdfReport.findOne({
      reportType: "bazaar-ledger",
      month,
      year,
      messId,
    });
    const replace = req.query.replace === "true";

    if (existingReport && !replace)
      return res.status(409).json({
        success: false,
        exists: true,
        message: `Bazaar Ledger PDF already exists for ${month} ${year}`,
        reportId: existingReport._id,
      });

    if (existingReport && replace) {
      await deleteFromImageKit(existingReport.fileId);
      await PdfReport.findByIdAndDelete(existingReport._id);
    }

    const bazaarList = await DailyBazaar.find({ month, year, messId })
      .populate("bazaarBy", "name")
      .sort({ date: 1 });

    if (bazaarList.length === 0)
      return res.status(404).json({
        success: false,
        message: "No Bazaar Data Found For This Month",
      });

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

    const pdfBuffer = await generateBazaarLedgerPdf({
      data: { month, year, entries },
    });

    const { fileUrl, fileId } = await uploadToImageKit(
      pdfBuffer,
      "bazaar-ledger.pdf",
      messId,
      folderName,
    );

    const report = await PdfReport.create({
      title: "Bazaar Ledger",
      reportType: "bazaar-ledger",
      month,
      year,
      folderName,
      fileUrl,
      fileId,
      createdBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed To Generate Bazaar Ledger PDF",
    });
  }
};
