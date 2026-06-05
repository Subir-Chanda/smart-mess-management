const mongoose = require("mongoose");

const mealEntrySchema = new mongoose.Schema(
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

    lunch: {
      type: Boolean,

      default: false,
    },

    dinner: {
      type: Boolean,

      default: false,
    },

    totalMeal: {
      type: Number,

      default: 0,
    },

    mealOn: {
      type: Boolean,

      default: true,
    },

    guestMeal: {
      type: Boolean,

      default: false,
    },

    guestMealType: {
      type: String,

      default: "",
    },

    guestCost: {
      type: Number,

      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MealEntry", mealEntrySchema);
