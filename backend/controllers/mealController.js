const DailyBazaar = require("../models/DailyBazaar");
const MealEntry = require("../models/MealEntry");
const Deposit = require("../models/Deposit");
const User = require("../models/User");
const imagekit = require("../config/imagekit");

// ======================================
// ADD DAILY BAZAAR
// ======================================

exports.addBazaar = async (req, res) => {
  try {
    const messId = req.user.messId;

    const date = req.body.date;
    const mealType = req.body.mealType;
    const bazaarBy = req.body.bazaarBy;
    const items = JSON.parse(req.body.items);
    const foodCategory = req.body.foodCategory;

    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    let billImage = "";
    if (req.file) {
      const uploadedImage = await imagekit.upload({
        file: req.file.buffer.toString("base64"),
        fileName: Date.now() + "-" + req.file.originalname,
      });
      billImage = uploadedImage.url;
    }

    let totalCost = 0;
    items.forEach((item) => {
      totalCost += Number(item.price);
    });

    const bazaar = new DailyBazaar({
      date,
      month,
      year,
      mealType,
      foodCategory,
      items,
      totalCost,
      bazaarBy,
      billImage,
      messId,
    });
    await bazaar.save();

    res
      .status(201)
      .json({ success: true, message: "Bazaar Added Successfully", bazaar });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================================
// GET DAILY BAZAAR
// ======================================

exports.getBazaar = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { month, year } = req.query;

    const currentDate = new Date();
    const selectedMonth =
      month || currentDate.toLocaleString("default", { month: "long" });
    const selectedYear = year || currentDate.getFullYear();

    const bazaar = await DailyBazaar.find({
      month: selectedMonth,
      year: selectedYear,
      messId,
    })
      .populate("bazaarBy", "name")
      .sort({ date: 1 });

    res.status(200).json({ success: true, bazaar });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================================
// SAVE MEAL
// ======================================

exports.saveMeal = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { userId, date, month, year, lunch, dinner } = req.body;

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });

    if (user.monthlyMealStatus === "OFF")
      return res
        .status(400)
        .json({ success: false, message: "Meal OFF For This Month" });

    if (user.mealPaused)
      return res
        .status(400)
        .json({ success: false, message: "Meal Is Paused" });

    let totalMeal = 0;
    if (lunch) totalMeal++;
    if (dinner) totalMeal++;

    await MealEntry.findOneAndUpdate(
      { user: userId, date, month, year, messId },
      { user: userId, date, month, year, lunch, dinner, totalMeal, messId },
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, message: "Meal Saved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================================
// GET MEALS
// ======================================

exports.getMeals = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { month, year } = req.query;

    const meals = await MealEntry.find({ month, year, messId });
    res.status(200).json({ success: true, meals });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ======================================
// GET ALL DEPOSITS
// ======================================

exports.getDeposits = async (req, res) => {
  try {
    const messId = req.user.messId;
    const deposits = await Deposit.find({ messId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, deposits });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Fetch Deposits" });
  }
};

// ======================================
// BAZAAR SUMMARY
// ======================================

exports.getBazaarSummary = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { month, year } = req.query;

    const currentDate = new Date();
    const selectedMonth =
      month || currentDate.toLocaleString("default", { month: "long" });
    const selectedYear = year || currentDate.getFullYear();

    const bazaar = await DailyBazaar.find({
      month: selectedMonth,
      year: selectedYear,
      messId,
    });

    const totalCost = bazaar.reduce((sum, item) => sum + item.totalCost, 0);
    const totalDays = bazaar.length;
    const highest =
      bazaar.length > 0 ? Math.max(...bazaar.map((b) => b.totalCost)) : 0;
    const lowest =
      bazaar.length > 0 ? Math.min(...bazaar.map((b) => b.totalCost)) : 0;
    const average = totalDays > 0 ? (totalCost / totalDays).toFixed(2) : 0;

    res
      .status(200)
      .json({ success: true, totalCost, totalDays, highest, lowest, average });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Fetch Bazaar Summary" });
  }
};
