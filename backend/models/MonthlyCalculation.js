const mongoose = require("mongoose");

const monthlyCalculationSchema = new mongoose.Schema(
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

    month: {
      type: String,
    },

    year: {
      type: Number,
    },

    totalMeals: {
      type: Number,

      default: 0,
    },

    deposit: {
      type: Number,

      default: 0,
    },

    mealCost: {
      type: Number,

      default: 0,
    },

    guestMealCost: {
      type: Number,

      default: 0,
    },

    fixedCost: {
      type: Number,

      default: 0,
    },

    rannaMasiCost: {
      type: Number,

      default: 0,
    },

    kajerMasiCost: {
      type: Number,

      default: 90,
    },

    finalDue: {
      type: Number,

      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MonthlyCalculation", monthlyCalculationSchema);
