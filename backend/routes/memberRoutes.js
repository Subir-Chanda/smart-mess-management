const express = require("express");

const router = express.Router();

const {
  getPendingUsers,

  approveUser,

  rejectUser,

  getAllMembers,

  transferAdmin,

  removeMember,
} = require("../controllers/memberController");

const authMiddleware = require("../middleware/authMiddleware");

// ======================================
// PENDING USERS
// ======================================

router.get(
  "/pending-users",

  authMiddleware,

  getPendingUsers,
);

// ======================================
// APPROVE USER
// ======================================

router.put(
  "/approve-user/:id",

  authMiddleware,

  approveUser,
);

// ======================================
// REJECT USER
// ======================================

router.delete(
  "/reject-user/:id",

  authMiddleware,

  rejectUser,
);

// ======================================
// ALL MEMBERS
// ======================================

router.get(
  "/all-members",

  authMiddleware,

  getAllMembers,
);

// ======================================
// TRANSFER ADMIN
// ======================================

router.put(
  "/transfer-admin",

  authMiddleware,

  transferAdmin,
);

// ======================================
// REMOVE MEMBER PERMANENTLY
// ======================================

router.delete(
  "/remove-member/:id",

  authMiddleware,

  removeMember,
);

module.exports = router;
