const User = require("../models/User");

// ======================================
// GET STATUS
// ======================================

exports.getMealStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      status: user.monthlyMealStatus,
      paused: user.mealPaused,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// MONTHLY ON/OFF
// ======================================

exports.updateMealStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const user = await User.findById(req.user._id);

    user.monthlyMealStatus = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: `Meal ${status}`,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// PAUSE
// ======================================

exports.pauseMeal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.mealPaused = true;

    user.mealPausedFrom = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: "Meal Paused",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ======================================
// RESUME
// ======================================

exports.resumeMeal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.mealPaused = false;

    user.mealPausedFrom = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Meal Resumed",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
