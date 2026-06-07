const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addMashiCost,
  getMashiCosts,
  addFixedExpense,
  getFixedExpenses,
  updateFixedExpense,
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

router.put("/expenses/:id", authMiddleware, updateFixedExpense);

module.exports = router;
