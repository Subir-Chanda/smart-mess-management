const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    amount: {
      type: Number,

      required: true,
    },

    screenshot: {
      type: String,

      required: true,
    },

    month: {
      type: String,
    },

    year: {
      type: Number,
    },

    status: {
      type: String,

      enum: ["pending", "approved", "rejected"],

      default: "pending",
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);
