const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");

exports.addRice = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Add Rice" });

    const messId = req.user.messId;
    const { quantity, cost, date } = req.body;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const rice = await RiceExpense.create({
      quantity,
      cost,
      date,
      month,
      year,
      addedBy: req.user._id,
      messId,
    });
    res.status(201).json({ success: true, rice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Add Rice" });
  }
};

exports.getRice = async (req, res) => {
  try {
    const messId = req.user.messId;
    const rice = await RiceExpense.find({ messId })
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, rice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Fetch Rice" });
  }
};

exports.addGas = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Add Gas" });

    const messId = req.user.messId;
    const { cylinderCount, cost, date } = req.body;
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const gas = await GasExpense.create({
      cylinderCount,
      cost,
      date,
      month,
      year,
      addedBy: req.user._id,
      messId,
    });
    res.status(201).json({ success: true, gas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Add Gas" });
  }
};

exports.getGas = async (req, res) => {
  try {
    const messId = req.user.messId;
    const gas = await GasExpense.find({ messId })
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, gas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Fetch Gas" });
  }
};

exports.getRiceTotal = async (req, res) => {
  try {
    const messId = req.user.messId;
    const rice = await RiceExpense.find({ messId });
    const totalCost = rice.reduce((sum, item) => sum + item.cost, 0);
    res.status(200).json({ success: true, totalCost });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.getGasTotal = async (req, res) => {
  try {
    const messId = req.user.messId;
    const gas = await GasExpense.find({ messId });
    const totalCost = gas.reduce((sum, item) => sum + item.cost, 0);
    res.status(200).json({ success: true, totalCost });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};

// ======================================
// UPDATE RICE
// ======================================

exports.updateRice = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Edit Rice" });

    const { quantity, cost, date } = req.body;
    const rice = await RiceExpense.findByIdAndUpdate(
      req.params.id,
      { quantity, cost, date },
      { new: true },
    );
    res.status(200).json({ success: true, rice });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Update Rice" });
  }
};

// ======================================
// UPDATE GAS
// ======================================

exports.updateGas = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Edit Gas" });

    const { cylinderCount, cost, date } = req.body;
    const gas = await GasExpense.findByIdAndUpdate(
      req.params.id,
      { cylinderCount, cost, date },
      { new: true },
    );
    res.status(200).json({ success: true, gas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed To Update Gas" });
  }
};
