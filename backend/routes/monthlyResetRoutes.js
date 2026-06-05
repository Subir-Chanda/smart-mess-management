const express = require("express");
const router = express.Router();
const {
  getResetStatus,
  checkMonthPdfStatus,
  performMonthlyReset,
  getResetHistory,
} = require("../controllers/monthlyResetController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.get("/status", authMiddleware, adminMiddleware, getResetStatus);
router.get("/pdf-check", authMiddleware, adminMiddleware, checkMonthPdfStatus);
router.post("/reset", authMiddleware, adminMiddleware, performMonthlyReset);
router.get("/history", authMiddleware, adminMiddleware, getResetHistory);

module.exports = router;
