const MonthLock = require("../models/MonthLock");

exports.getLockStatus = async (req, res) => {
  try {
    const messId = req.user.messId;
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear();

    const lockDoc = await MonthLock.findOne({
      month: currentMonth,
      year: currentYear,
      messId,
    });

    res.status(200).json({
      success: true,
      isLocked: lockDoc?.isLocked || false,
      month: currentMonth,
      year: currentYear,
      lockedAt: lockDoc?.lockedAt || null,
    });
  } catch (error) {
    console.error("getLockStatus error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
