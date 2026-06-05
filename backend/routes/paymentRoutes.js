const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
  createPaymentRequest,
  getPaymentRequests,
  approvePayment,
  rejectPayment,
  getLatestQR,
} = require("../controllers/paymentController");

// ======================================
// CREATE PAYMENT REQUEST
// ======================================

router.post(
  "/create",
  authMiddleware,
  upload.single("screenshot"),
  createPaymentRequest,
);

// ======================================
// GET ALL PAYMENT REQUESTS
// ======================================

router.get("/all", authMiddleware, getPaymentRequests);

// ======================================
// APPROVE PAYMENT
// ======================================

router.put("/approve/:id", authMiddleware, approvePayment);

// ======================================
// REJECT PAYMENT
// ======================================

router.put("/reject/:id", authMiddleware, rejectPayment);

// ======================================
// GET LATEST QR
// ======================================

router.get("/get-qr", getLatestQR);

module.exports = router;
