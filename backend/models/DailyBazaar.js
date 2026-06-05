const mongoose = require("mongoose");

// ======================================
// ITEM SCHEMA
// ======================================

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,

    required: true,
  },

  price: {
    type: Number,

    required: true,
  },
});

// ======================================
// DAILY BAZAAR
// ======================================

const dailyBazaarSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
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

    mealType: {
      type: String,

      enum: ["Lunch", "Dinner"],

      required: true,
    },
    foodCategory: {
      type: String,
      enum: ["Sobji", "Fish", "Egg", "Chicken", "Grand Meal"],
      required: true,
    },

    items: [itemSchema],

    totalCost: {
      type: Number,

      default: 0,
    },

    billImage: {
      type: String,
      default: "",
    },

    bazaarBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model(
  "DailyBazaar",

  dailyBazaarSchema,
);
