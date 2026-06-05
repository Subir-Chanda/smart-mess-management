const mongoose = require("mongoose");

const mashiCostSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    rannaMashiCost: {
      type: Number,
      required: true,
    },

    kajerMashiCost: {
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

module.exports = mongoose.model("MashiCost", mashiCostSchema);
