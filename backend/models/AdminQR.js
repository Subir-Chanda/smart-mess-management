const mongoose = require("mongoose");

const adminQRSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    qrImage: {
      type: String,
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

module.exports = mongoose.model("AdminQR", adminQRSchema);
