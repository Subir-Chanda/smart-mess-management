const User = require("../models/User");

exports.getPendingUsers = async (req, res) => {
  try {
    const messId = req.user.messId;
    const users = await User.find(
      { approvalStatus: "pending", messId },
      "name email role approvalStatus",
    );
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.approveUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, {
      approvalStatus: "approved",
      setupStatus: "active",
    });
    res
      .status(200)
      .json({ success: true, message: "User Approved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "User Rejected Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllMembers = async (req, res) => {
  try {
    const messId = req.user.messId;
    const users = await User.find(
      { approvalStatus: "approved", messId },
      "name email role approvalStatus monthlyMealStatus mealPaused",
    );
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { id } = req.params;

    // Cannot remove yourself
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot remove yourself." });
    }

    // Member must belong to same mess
    const member = await User.findOne({ _id: id, messId });
    if (!member) {
      return res
        .status(404)
        .json({ success: false, message: "Member not found in this mess." });
    }

    // Cannot remove another admin
    if (member.role === "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot remove an admin." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `${member.name} has been permanently removed.`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.transferAdmin = async (req, res) => {
  try {
    const messId = req.user.messId;
    const { userId } = req.body;

    // Remove admin role only within this mess
    await User.updateMany({ role: "admin", messId }, { role: "member" });
    await User.findByIdAndUpdate(userId, { role: "admin" });

    res
      .status(200)
      .json({ success: true, message: "Admin Transferred Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
