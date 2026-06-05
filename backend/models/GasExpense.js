const mongoose = require("mongoose");

const gasExpenseSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    cylinderCount: {
      type: Number,
      required: true,
    },

    cost: {
      type: Number,
      required: true,
    },

    date: {
      type: Number,
      required: true,
    },

    month: {
      type: String,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GasExpense", gasExpenseSchema);
