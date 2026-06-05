const User = require("../models/User");
const Deposit = require("../models/Deposit");
const MealEntry = require("../models/MealEntry");
const DailyBazaar = require("../models/DailyBazaar");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const FixedExpense = require("../models/FixedExpense");
const MashiCost = require("../models/MashiCost");
const GuestMealRate = require("../models/GuestMealRate");
const mongoose = require("mongoose");

exports.getMonthlyCalculation = async (req, res) => {
  try {
    const messId = req.user.messId;
    const messObjectId = new mongoose.Types.ObjectId(messId);

    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    // USERS
    const users = await User.find({ approvalStatus: "approved", messId });

    // BAZAAR
    const bazaarData = await DailyBazaar.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);
    const totalBazaarCost = bazaarData[0]?.total || 0;

    // RICE
    const riceData = await RiceExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalRiceCost = riceData[0]?.total || 0;

    // GAS
    const gasData = await GasExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$cost" } } },
    ]);
    const totalGasCost = gasData[0]?.total || 0;

    // GUEST
    const guestData = await GuestMeal.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$totalCost" } } },
    ]);
    const totalGuestCost = guestData[0]?.total || 0;

    // FIXED COST
    const fixedData = await FixedExpense.aggregate([
      { $match: { month, year, messId: messObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalFixedCost = fixedData[0]?.total || 0;

    // MASHI — latest for this mess
    const latestMashi = await MashiCost.findOne({ messId }).sort({
      createdAt: -1,
    });
    const rannaRate = latestMashi?.rannaMashiCost || 0;
    const kajerRate = latestMashi?.kajerMashiCost || 0;

    // GUEST RATE for this mess
    const guestRate = await GuestMealRate.findOne({ messId }).sort({
      createdAt: -1,
    });

    // ELIGIBLE MEALS + LOW MEAL RECOVERY
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
              if (bazaarEntry) {
                memberGuestCost += getRateForCategory(
                  bazaarEntry.foodCategory,
                  guestRate,
                );
              }
            }
          }
        }
        totalLowMealRecovery += memberGuestCost;
      }

      if (mealCount >= 30) eligibleMeals += mealCount;
      else if (mealCount >= 11) eligibleMeals += 30;

      memberRows.push({ user, mealCount });
    }

    // MEAL RATE
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
              if (bazaarEntry) {
                lowMealCost += getRateForCategory(
                  bazaarEntry.foodCategory,
                  guestRate,
                );
              }
            }
          }
        }
        mealCost = lowMealCost;
      }

      let rannaCost = 0;
      const kajerCost = Number(kajerRate);

      if (user.monthlyMealStatus === "ON") {
        rannaCost = Number(rannaRate);
      }

      totalMashiCost += rannaCost + kajerCost;

      const totalCost =
        mealCost +
        guestCost +
        rannaCost +
        kajerCost +
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
        kajerCost,
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

    res.status(200).json({
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
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

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
