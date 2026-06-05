const Mess = require("../models/Mess");
const User = require("../models/User");

// ======================================
// CREATE MESS
// No role check — always sets creator as admin
// ======================================

exports.createMess = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mess name is required.",
      });
    }

    // Check mess name not already taken
    const existing = await Mess.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A mess with this name already exists.",
      });
    }

    // Create mess
    const mess = await Mess.create({
      name: name.trim(),
      createdBy: userId,
    });

    // Set role to admin here (not at registration)
    await User.findByIdAndUpdate(userId, {
      messId: mess._id,
      role: "admin",
      setupStatus: "active",
      approvalStatus: "approved",
    });

    res.status(201).json({
      success: true,
      message: `Mess "${mess.name}" created successfully.`,
      mess: {
        _id: mess._id,
        name: mess.name,
      },
    });
  } catch (error) {
    console.error("createMess error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// LIST ALL MESSES
// For the "Join a mess" browse screen
// ======================================

exports.listMesses = async (req, res) => {
  try {
    const messes = await Mess.find({ isActive: true })
      .select("name createdAt")
      .sort({ name: 1 });

    // Get member counts per mess
    const messesWithCount = await Promise.all(
      messes.map(async (mess) => {
        const memberCount = await User.countDocuments({
          messId: mess._id,
          approvalStatus: "approved",
        });
        return {
          _id: mess._id,
          name: mess.name,
          memberCount,
          createdAt: mess.createdAt,
        };
      }),
    );

    res.status(200).json({
      success: true,
      messes: messesWithCount,
    });
  } catch (error) {
    console.error("listMesses error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// REQUEST TO JOIN A MESS
// User picks a mess + role → sends join request
// Admin of that mess approves via member panel
// ======================================

exports.requestJoinMess = async (req, res) => {
  try {
    const { messId, role } = req.body; // role sent from PostSignup.jsx
    const userId = req.user._id;

    const mess = await Mess.findById(messId);
    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess not found.",
      });
    }

    const assignedRole = role === "admin" ? "admin" : "member"; // safe default

    // Update user — link to mess, save role, mark pending approval
    await User.findByIdAndUpdate(userId, {
      messId: mess._id,
      role: assignedRole,
      setupStatus: "pending_approval",
      approvalStatus: "pending",
    });

    res.status(200).json({
      success: true,
      message: `Join request sent to ${mess.name}. Waiting for admin approval.`,
      messName: mess.name,
    });
  } catch (error) {
    console.error("requestJoinMess error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// GET MESS INFO
// Returns the mess name for the navbar
// ======================================

exports.getMyMess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("messId", "name");
    if (!user?.messId) {
      return res.status(200).json({ success: true, mess: null });
    }
    res.status(200).json({
      success: true,
      mess: {
        _id: user.messId._id,
        name: user.messId.name,
      },
    });
  } catch (error) {
    console.error("getMyMess error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// GET PENDING JOIN REQUESTS
// For admin — shows who wants to join their mess
// ======================================

exports.getPendingRequests = async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);
    if (!adminUser.messId) {
      return res.status(400).json({
        success: false,
        message: "You are not assigned to a mess.",
      });
    }

    const pending = await User.find({
      messId: adminUser.messId,
      approvalStatus: "pending",
      setupStatus: "pending_approval",
    }).select("name email role createdAt"); // added role to see what they requested

    res.status(200).json({ success: true, requests: pending });
  } catch (error) {
    console.error("getPendingRequests error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================
// APPROVE / REJECT JOIN REQUEST
// Admin approves or rejects a member
// ======================================

exports.handleJoinRequest = async (req, res) => {
  try {
    const { userId, action } = req.body; // action: "approve" | "reject"

    const adminUser = await User.findById(req.user._id);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Make sure this user is requesting to join admin's mess
    if (String(targetUser.messId) !== String(adminUser.messId)) {
      return res.status(403).json({
        success: false,
        message: "This user is not requesting to join your mess.",
      });
    }

    if (action === "approve") {
      await User.findByIdAndUpdate(userId, {
        approvalStatus: "approved",
        setupStatus: "active",
      });
      return res.status(200).json({
        success: true,
        message: `${targetUser.name} approved and added to your mess.`,
      });
    }

    if (action === "reject") {
      // Reset user — they can try joining another mess
      await User.findByIdAndUpdate(userId, {
        messId: null,
        role: "member",
        approvalStatus: "pending",
        setupStatus: "pending_mess",
      });
      return res.status(200).json({
        success: true,
        message: `${targetUser.name}'s request rejected.`,
      });
    }

    res.status(400).json({ success: false, message: "Invalid action." });
  } catch (error) {
    console.error("handleJoinRequest error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
