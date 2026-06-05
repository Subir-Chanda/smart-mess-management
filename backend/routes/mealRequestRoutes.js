const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createMealRequest,
  getMealRequests,
  approveMealRequest,
  rejectMealRequest,
} = require("../controllers/mealRequestController");

// MEMBER

router.post("/create", authMiddleware, createMealRequest);

// ADMIN

router.get("/all", authMiddleware, getMealRequests);

router.put("/approve/:id", authMiddleware, approveMealRequest);

router.put("/reject/:id", authMiddleware, rejectMealRequest);

module.exports = router;
