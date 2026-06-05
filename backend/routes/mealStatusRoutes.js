const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  updateMealStatus,
  pauseMeal,
  resumeMeal,
  getMealStatus,
} = require("../controllers/mealStatusController");

router.get("/status", authMiddleware, getMealStatus);

router.put("/monthly-status", authMiddleware, updateMealStatus);

router.put("/pause", authMiddleware, pauseMeal);

router.put("/resume", authMiddleware, resumeMeal);

module.exports = router;
