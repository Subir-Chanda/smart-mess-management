const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addMashiCost,
  getMashiCosts,
  addFixedExpense,
  getFixedExpenses,
} = require("../controllers/fixedCostController");

// ======================================
// MASHI
// ======================================

router.post("/add-mashi", authMiddleware, addMashiCost);

router.get("/mashi", authMiddleware, getMashiCosts);

// ======================================
// FIXED EXPENSE
// ======================================

router.post("/add-expense", authMiddleware, addFixedExpense);

router.get("/expenses", authMiddleware, getFixedExpenses);

module.exports = router;
