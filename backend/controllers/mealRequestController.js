const MealRequest = require("../models/MealRequest");
const User = require("../models/User");

exports.createMealRequest = async (req, res) => {
  try {
    const { requestType } = req.body;
    const request = await MealRequest.create({
      user: req.user._id,
      requestType,
      messId: req.user.messId,
    });
    res
      .status(201)
      .json({ success: true, message: "Meal Request Submitted", request });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMealRequests = async (req, res) => {
  try {
    const messId = req.user.messId;
    const requests = await MealRequest.find({ status: "pending", messId })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.approveMealRequest = async (req, res) => {
  try {
    const request = await MealRequest.findById(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request Not Found" });

    const user = await User.findById(request.user);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });

    switch (request.requestType) {
      case "MONTHLY_ON":
        user.monthlyMealStatus = "ON";
        break;
      case "MONTHLY_OFF":
        user.monthlyMealStatus = "OFF";
        break;
      case "PAUSE":
        user.mealPaused = true;
        user.mealPausedFrom = new Date();
        break;
      case "RESUME":
        user.mealPaused = false;
        user.mealPausedFrom = null;
        break;
    }
    await user.save();

    request.status = "approved";
    await request.save();

    res.status(200).json({ success: true, message: "Meal Request Approved" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.rejectMealRequest = async (req, res) => {
  try {
    const request = await MealRequest.findById(req.params.id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "Request Not Found" });
    request.status = "rejected";
    await request.save();
    res.status(200).json({ success: true, message: "Meal Request Rejected" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
