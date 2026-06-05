const MashiCost = require("../models/MashiCost");
const FixedExpense = require("../models/FixedExpense");

// ======================================
// ADD MASHI COST
// ======================================

exports.addMashiCost = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Add Mashi Cost" });
    }

    const messId = req.user.messId;
    const { rannaMashiCost, kajerMashiCost } = req.body;

    const mashi = await MashiCost.create({
      rannaMashiCost,
      kajerMashiCost,
      addedBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, mashi });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

// ======================================
// GET MASHI COST LOGS
// ======================================

exports.getMashiCosts = async (req, res) => {
  try {
    const messId = req.user.messId;
    const mashi = await MashiCost.find({ messId })
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, mashi });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

// ======================================
// ADD FIXED EXPENSE
// ======================================

exports.addFixedExpense = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only Admin Can Add Expenses" });
    }

    const messId = req.user.messId;
    const { expenseName, amount, date } = req.body;

    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const expense = await FixedExpense.create({
      expenseName,
      amount,
      date,
      month,
      year,
      addedBy: req.user._id,
      messId,
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

// ======================================
// GET FIXED EXPENSES
// ======================================

exports.getFixedExpenses = async (req, res) => {
  try {
    const messId = req.user.messId;
    const expenses = await FixedExpense.find({ messId })
      .populate("addedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};
