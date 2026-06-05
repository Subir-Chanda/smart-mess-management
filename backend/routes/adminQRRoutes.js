const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const { uploadQR, getCurrentQR } = require("../controllers/adminQRController");

// ======================================
// UPLOAD QR
// ======================================

router.post("/upload", authMiddleware, upload.single("qr"), uploadQR);

// ======================================
// GET CURRENT QR
// ======================================

router.get("/current", authMiddleware, getCurrentQR);

module.exports = router;
