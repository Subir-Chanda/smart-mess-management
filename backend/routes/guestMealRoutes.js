const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addGuestMeal,
  getGuestMeals,
  deleteGuestMeal,
  getGuestRates,
  updateGuestRates,
  getTotalGuestCost,
  updateGuestMeal,
} = require("../controllers/guestMealController");

// ======================================
// GUEST MEALS
// ======================================

router.post("/add", authMiddleware, addGuestMeal);

router.get("/all", authMiddleware, getGuestMeals);

router.delete("/delete/:id", authMiddleware, deleteGuestMeal);

router.put("/update/:id", authMiddleware, updateGuestMeal);

router.get("/total-cost", authMiddleware, getTotalGuestCost);
// ======================================
// GUEST MEAL RATES
// ======================================

router.get("/rates", authMiddleware, getGuestRates);

router.put("/rates", authMiddleware, updateGuestRates);

module.exports = router;
