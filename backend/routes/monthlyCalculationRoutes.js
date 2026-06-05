const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMonthlyCalculation,
} = require("../controllers/monthlyCalculationController");

router.get("/current", authMiddleware, getMonthlyCalculation);

module.exports = router;
