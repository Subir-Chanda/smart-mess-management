const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  createMess,
  listMesses,
  requestJoinMess,
  getMyMess,
  getPendingRequests,
  handleJoinRequest,
} = require("../controllers/messController");

// Public — anyone can browse available messes
router.get("/list", listMesses);

// Auth required
router.post("/create", authMiddleware, createMess);
router.post("/join-request", authMiddleware, requestJoinMess);
router.get("/my-mess", authMiddleware, getMyMess);

// Admin only — join request management
router.get("/pending-requests", authMiddleware, getPendingRequests);
router.post("/handle-request", authMiddleware, handleJoinRequest);

module.exports = router;
