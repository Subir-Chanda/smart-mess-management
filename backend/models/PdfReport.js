const mongoose = require("mongoose");

const PdfReportSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    reportType: {
      type: String, // "monthly-calculation", "deposit", "meal-khata", "meal-grid", "bazaar-ledger"
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
    folderName: {
      type: String, // e.g. "June-2026"
      required: true,
    },
    fileUrl: {
      type: String, // ImageKit public URL
      required: true,
    },
    fileId: {
      type: String, // ImageKit fileId (needed for deletion)
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PdfReport", PdfReportSchema);
