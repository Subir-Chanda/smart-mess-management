/**
 * MIGRATION SCRIPT — Run ONCE to set up multi-mess architecture
 *
 * What this does:
 * 1. Creates the NDC mess document
 * 2. Assigns all existing users to NDC mess
 * 3. Marks existing admin as active, members as active
 * 4. Adds messId to all existing data documents
 *
 * Run with: node migrations/addMessId.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// ── Models ──
const Mess = require("../models/Mess");
const User = require("../models/User");
const MealEntry = require("../models/MealEntry");
const Deposit = require("../models/Deposit");
const DailyBazaar = require("../models/DailyBazaar");
const RiceExpense = require("../models/RiceExpense");
const GasExpense = require("../models/GasExpense");
const GuestMeal = require("../models/GuestMeal");
const FixedExpense = require("../models/FixedExpense");
const MashiCost = require("../models/MashiCost");
const GuestMealRate = require("../models/GuestMealRate");
const MonthlyResetLog = require("../models/MonthlyResetLog");
const MonthLock = require("../models/MonthLock");
const PdfReport = require("../models/PdfReport");

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // ── STEP 1: Find existing admin ──
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ No admin user found. Aborting.");
      process.exit(1);
    }
    console.log(`✅ Found admin: ${admin.name}`);

    // ── STEP 2: Create NDC mess (skip if already exists) ──
    let ndcMess = await Mess.findOne({ name: "NDC" });
    if (!ndcMess) {
      ndcMess = await Mess.create({
        name: "NDC",
        createdBy: admin._id,
        isActive: true,
      });
      console.log(`✅ Created NDC mess: ${ndcMess._id}`);
    } else {
      console.log(`✅ NDC mess already exists: ${ndcMess._id}`);
    }

    const messId = ndcMess._id;

    // ── STEP 3: Update all users ──
    const userResult = await User.updateMany(
      { messId: null },
      {
        $set: {
          messId,
          setupStatus: "active",
        },
      },
    );
    console.log(`✅ Updated ${userResult.modifiedCount} users with messId`);

    // ── STEP 4: Add messId to all data collections ──
    const collections = [
      { model: MealEntry, name: "MealEntry" },
      { model: Deposit, name: "Deposit" },
      { model: DailyBazaar, name: "DailyBazaar" },
      { model: RiceExpense, name: "RiceExpense" },
      { model: GasExpense, name: "GasExpense" },
      { model: GuestMeal, name: "GuestMeal" },
      { model: FixedExpense, name: "FixedExpense" },
      { model: MashiCost, name: "MashiCost" },
      { model: GuestMealRate, name: "GuestMealRate" },
      { model: MonthlyResetLog, name: "MonthlyResetLog" },
      { model: MonthLock, name: "MonthLock" },
      { model: PdfReport, name: "PdfReport" },
    ];

    for (const { model, name } of collections) {
      try {
        const result = await model.updateMany(
          { messId: { $exists: false } },
          { $set: { messId } },
        );
        console.log(`✅ ${name}: ${result.modifiedCount} documents updated`);
      } catch (err) {
        console.log(`⚠️  ${name}: skipped (${err.message})`);
      }
    }

    console.log("\n🎉 Migration complete! NDC mess is set up.");
    console.log(`   Mess ID: ${messId}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
