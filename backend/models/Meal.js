const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
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

    lunch: {
      type: Number,

      default: 0,
    },

    dinner: {
      type: Number,

      default: 0,
    },

    totalMeals: {
      type: Number,

      default: 0,
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

module.exports = mongoose.model("Meal", mealSchema);
