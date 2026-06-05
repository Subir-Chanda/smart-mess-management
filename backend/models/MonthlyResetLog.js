const mongoose = require("mongoose");

// ======================================
// MONTHLY RESET LOG MODEL
// Permanent audit trail of every reset.
// Never deleted.
// ======================================

const MonthlyResetLogSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    // Which month/year was reset
    month: {
      type: String,
      required: true, // e.g. "June"
    },
    year: {
      type: Number,
      required: true, // e.g. 2026
    },

    // Admin who triggered the reset
    resetBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // How many documents were deleted per collection
    deletedCounts: {
      mealEntries: { type: Number, default: 0 },
      deposits: { type: Number, default: 0 },
      bazaarEntries: { type: Number, default: 0 },
      riceExpenses: { type: Number, default: 0 },
      gasExpenses: { type: Number, default: 0 },
      guestMeals: { type: Number, default: 0 },
      fixedExpenses: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
  // No unique index — same month can be reset multiple times
);

module.exports = mongoose.model("MonthlyResetLog", MonthlyResetLogSchema);
