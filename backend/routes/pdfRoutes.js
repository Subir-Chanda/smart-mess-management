const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getFolders,
  getReportsByFolder,
  deleteReport,
  generateMonthlyPdfReport,
  generateDepositPdfReport,
  generateMealKhataPdfReport,
  generateMealGridPdfReport,
  generateBazaarLedgerPdfReport,
  downloadPdf,
} = require("../controllers/pdfController");

// ======================================
// GET ALL PDF FOLDERS
// ======================================

router.get("/folders", authMiddleware, getFolders);

// ======================================
// GET PDFS OF A FOLDER
// ======================================

router.get("/folder/:folderName", authMiddleware, getReportsByFolder);

// ======================================
// DELETE PDF
// ======================================
router.post("/generate/monthly", authMiddleware, generateMonthlyPdfReport);
router.post("/generate/deposit", authMiddleware, generateDepositPdfReport);
router.delete("/:id", authMiddleware, deleteReport);
router.get("/download/:id", authMiddleware, downloadPdf);
router.post("/generate/meal-khata", authMiddleware, generateMealKhataPdfReport);
router.post("/generate/meal-grid", authMiddleware, generateMealGridPdfReport);
router.post(
  "/generate/bazaar-ledger",
  authMiddleware,
  generateBazaarLedgerPdfReport,
);

module.exports = router;
