const User = require("../models/User");
const MealEntry = require("../models/MealEntry");
const DailyBazaar = require("../models/DailyBazaar");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const Deposit = require("../models/Deposit");
const FixedExpense = require("../models/FixedExpense");

// ======================================
// GET DASHBOARD STATS
// ======================================

exports.getDashboardStats = async (req, res) => {
  try {
    const messId = req.user.messId;

    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const [
      totalMembers,
      pendingRequests,
      mealResult,
      bazaarResult,
      riceResult,
      gasResult,
      guestResult,
      depositResult,
      fixedCostResult,
    ] = await Promise.all([
      User.countDocuments({ approvalStatus: "approved", messId }),

      User.countDocuments({ approvalStatus: "pending", messId }),

      MealEntry.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalMeals: { $sum: "$totalMeal" } } },
      ]),

      DailyBazaar.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalExpenses: { $sum: "$totalCost" } } },
      ]),

      RiceExpense.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalRiceCost: { $sum: "$cost" } } },
      ]),

      GasExpense.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalGasCost: { $sum: "$cost" } } },
      ]),

      GuestMeal.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalGuestCost: { $sum: "$totalCost" } } },
      ]),

      Deposit.aggregate([
        { $match: { messId } },
        { $group: { _id: null, totalDeposits: { $sum: "$amount" } } },
      ]),

      FixedExpense.aggregate([
        { $match: { month, year, messId } },
        { $group: { _id: null, totalFixedCost: { $sum: "$amount" } } },
      ]),
    ]);

    const totalMeals = mealResult[0]?.totalMeals || 0;
    const totalBazaarCost = bazaarResult[0]?.totalExpenses || 0;
    const totalRiceCost = riceResult[0]?.totalRiceCost || 0;
    const totalGasCost = gasResult[0]?.totalGasCost || 0;
    const totalGuestCost = guestResult[0]?.totalGuestCost || 0;
    const totalDeposits = depositResult[0]?.totalDeposits || 0;
    const totalFixedCost = fixedCostResult[0]?.totalFixedCost || 0;

    const messFundBalance = totalDeposits - (totalBazaarCost + totalFixedCost);
    const finalBazaarCost =
      totalBazaarCost + totalRiceCost + totalGasCost - totalGuestCost;
    const currentMealRate =
      totalMeals > 0 ? (finalBazaarCost / totalMeals).toFixed(2) : 0;
    const totalExpenses =
      totalBazaarCost + totalRiceCost + totalGasCost - totalGuestCost;

    // Total dues = total what members owe - what they've deposited
    // Positive = members owe money, Negative = mess has surplus
    const totalDues = Math.max(
      0,
      totalExpenses + totalFixedCost - totalDeposits,
    );

    res.status(200).json({
      success: true,
      stats: {
        totalMembers,
        pendingRequests,
        totalMeals,
        totalExpenses,
        totalRiceCost,
        totalGasCost,
        totalGuestCost,
        totalDeposits,
        totalFixedCost,
        messFundBalance,
        finalBazaarCost,
        currentMealRate,
        totalDues,
      },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Fetch Dashboard Stats" });
  }
};
