const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    title: {
      type: String,
    },

    amount: {
      type: Number,

      default: 0,
    },

    category: {
      type: String,

      enum: ["bazaar", "rice", "gas", "others"],
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

module.exports = mongoose.model("Expense", expenseSchema);
