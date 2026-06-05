const GuestMeal = require("../models/GuestMeal");
const GuestMealRate = require("../models/GuestMealRate");

exports.addGuestMeal = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { member, guestCount, mealType, date } = req.body;

    let rates = await GuestMealRate.findOne({ messId });
    if (!rates) rates = await GuestMealRate.create({ messId });

    let rate = 0;
    switch (mealType) {
      case "Sobji":
        rate = rates.sobji;
        break;
      case "Fish":
        rate = rates.fish;
        break;
      case "Egg":
        rate = rates.egg;
        break;
      case "Chicken":
        rate = rates.chicken;
        break;
      case "Grand Meal":
        rate = rates.grandMeal;
        break;
      default:
        rate = 0;
    }

    const totalCost = Number(guestCount) * Number(rate);
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const guestMeal = await GuestMeal.create({
      member,
      guestCount,
      mealType,
      rate,
      totalCost,
      date,
      month,
      year,
      messId,
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Guest Meal Added Successfully",
        guestMeal,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getGuestMeals = async (req, res) => {
  try {
    const messId = req.user.messId;
    const guestMeals = await GuestMeal.find({ messId })
      .populate("member", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, guestMeals });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed To Fetch Guest Meals" });
  }
};

exports.deleteGuestMeal = async (req, res) => {
  try {
    await GuestMeal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Guest Meal Deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getGuestRates = async (req, res) => {
  try {
    const messId = req.user.messId;
    let rates = await GuestMealRate.findOne({ messId });
    if (!rates) rates = await GuestMealRate.create({ messId });
    res.status(200).json({ success: true, rates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Fetch Rates" });
  }
};

exports.updateGuestRates = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { sobji, fish, egg, chicken, grandMeal } = req.body;

    let rates = await GuestMealRate.findOne({ messId });
    if (!rates) rates = await GuestMealRate.create({ messId });

    rates.sobji = sobji;
    rates.fish = fish;
    rates.egg = egg;
    rates.chicken = chicken;
    rates.grandMeal = grandMeal;
    await rates.save();

    res
      .status(200)
      .json({ success: true, message: "Guest Meal Rates Updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTotalGuestCost = async (req, res) => {
  try {
    const messId = req.user.messId;
    const guestMeals = await GuestMeal.find({ messId });
    const totalCost = guestMeals.reduce((sum, meal) => sum + meal.totalCost, 0);
    res.status(200).json({ success: true, totalCost });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
