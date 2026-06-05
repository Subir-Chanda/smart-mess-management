const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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

      default: "",
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
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "PaymentRequest",
  paymentSchema,
  "paymentrequests",
);
