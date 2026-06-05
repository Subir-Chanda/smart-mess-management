const express = require("express");
const router = express.Router();
const { getLockStatus } = require("../controllers/monthLockController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/status", authMiddleware, getLockStatus);

module.exports = router;
