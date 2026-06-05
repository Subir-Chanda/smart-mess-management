const mongoose = require("mongoose");

const guestMealSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    guestCount: {
      type: Number,
      required: true,
    },

    mealType: {
      type: String,
      required: true,
    },

    rate: {
      type: Number,
      required: true,
    },

    totalCost: {
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("GuestMeal", guestMealSchema);
