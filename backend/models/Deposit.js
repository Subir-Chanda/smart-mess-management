const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    amount: {
      type: Number,

      default: 0,
    },

    date: {
      type: Number,

      required: true,
    },

    month: {
      type: String,
    },

    year: {
      type: Number,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Deposit", depositSchema);
