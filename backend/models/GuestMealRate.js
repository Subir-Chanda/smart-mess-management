const mongoose = require("mongoose");

const guestMealRateSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    sobji: {
      type: Number,
      default: 35,
    },

    fish: {
      type: Number,
      default: 55,
    },

    egg: {
      type: Number,
      default: 50,
    },

    chicken: {
      type: Number,
      default: 70,
    },

    grandMeal: {
      type: Number,
      default: 130,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GuestMealRate", guestMealRateSchema);
