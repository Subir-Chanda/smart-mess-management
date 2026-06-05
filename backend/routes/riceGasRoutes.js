const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addRice,
  getRice,
  addGas,
  getGas,
  getRiceTotal,
  getGasTotal,
} = require("../controllers/riceGasController");

// ======================================
// RICE
// ======================================

router.post("/add-rice", authMiddleware, addRice);

router.get("/rice", authMiddleware, getRice);

router.get("/rice-total", authMiddleware, getRiceTotal);

// ======================================
// GAS
// ======================================

router.post("/add-gas", authMiddleware, addGas);

router.get("/gas", authMiddleware, getGas);

router.get("/gas-total", authMiddleware, getGasTotal);

module.exports = router;
