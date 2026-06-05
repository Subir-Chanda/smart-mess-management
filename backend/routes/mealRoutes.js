const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  addBazaar,
  getBazaar,
  saveMeal,
  getMeals,
  getDeposits,
  getBazaarSummary,
} = require("../controllers/mealController");

// ======================================
// ADD BAZAAR
// ======================================

router.post(
  "/add-bazaar",
  authMiddleware,
  upload.single("billImage"),
  addBazaar,
);

// ======================================
// GET BAZAAR
// ======================================

router.get("/daily-bazaar", authMiddleware, getBazaar);

// ======================================
// SAVE MEAL
// ======================================

router.post("/save-meal", authMiddleware, saveMeal);

// ======================================
// GET MEALS
// ======================================

router.get("/get-meals", authMiddleware, getMeals);
// ======================================
// GET DEPOSITS
// ======================================

router.get("/deposits", authMiddleware, getDeposits);

// ======================================
// BAZAAR SUMMARY
// ======================================

router.get("/bazaar-summary", authMiddleware, getBazaarSummary);

module.exports = router;
