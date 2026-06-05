const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
    },
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    monthlyMealStatus: {
      type: String,
      enum: ["ON", "OFF"],
      default: "ON",
    },

    mealPaused: {
      type: Boolean,
      default: false,
    },

    mealPausedFrom: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
