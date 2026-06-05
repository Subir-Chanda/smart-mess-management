require("dotenv").config();

const express = require("express");

const cors = require("cors");

// ======================================
// DATABASE CONNECTION
// ======================================

const connectDB = require("./config/db");

// ======================================
// ROUTES
// ======================================

const authRoutes = require("./routes/authRoutes");

const memberRoutes = require("./routes/memberRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const mealRoutes = require("./routes/mealRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

const adminQRRoutes = require("./routes/adminQRRoutes");

const mealStatusRoutes = require("./routes/mealStatusRoutes");

const mealRequestRoutes = require("./routes/mealRequestRoutes");

const guestMealRoutes = require("./routes/guestMealRoutes");

const riceGasRoutes = require("./routes/riceGasRoutes");

const fixedCostRoutes = require("./routes/fixedCostRoutes");

const monthlyCalculationRoutes = require("./routes/monthlyCalculationRoutes");

const pdfRoutes = require("./routes/pdfRoutes");

const monthlyResetRoutes = require("./routes/monthlyResetRoutes");

const monthLockRoutes = require("./routes/monthLockRoutes");

const messRoutes = require("./routes/messRoutes");

// ======================================
// CRON JOBS
// ======================================

const { startAllCronJobs } = require("./cron/cronJobs");

// ======================================
// EXPRESS APP
// ======================================

const app = express();

// ======================================
// MIDDLEWARES
// ======================================

// ENABLE CORS

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    exposedHeaders: ["Content-Disposition", "Content-Type", "Content-Length"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  }),
);

// JSON PARSER

app.use(express.json());

// ======================================
// CONNECT DATABASE
// ======================================

connectDB();

// ======================================
// API ROUTES
// ======================================

// AUTH ROUTES

app.use("/api/auth", authRoutes);

// MEMBER MANAGEMENT ROUTES

app.use("/api/member", memberRoutes);

//Dashboard routes
app.use("/api/dashboard", dashboardRoutes);

// Meal Routes
app.use("/api/meal", mealRoutes);

// payment routes
app.use("/api/payment", paymentRoutes);

//adminQr routes
app.use("/api/admin-qr", adminQRRoutes);

// meal status routes
app.use("/api/meal-status", mealStatusRoutes);

// meal status request contoller routes
app.use("/api/meal-request", mealRequestRoutes);

// GUEST MEAL ROUTES
app.use("/api/guest-meal", guestMealRoutes);

// rice gas page routes
app.use("/api/rice-gas", riceGasRoutes);

// fixed cost routes
app.use("/api/fixed-cost", fixedCostRoutes);

// monthly calculation routes
app.use("/api/monthly-calculation", monthlyCalculationRoutes);

// pdf routes
app.use("/api/pdf", pdfRoutes);

// monthly reset routes
app.use("/api/monthly-reset", monthlyResetRoutes);

// month lock routes
app.use("/api/month-lock", monthLockRoutes);

// mess routes
app.use("/api/mess", messRoutes);

// ======================================
// TEST ROUTE
// ======================================

app.get("/", (req, res) => {
  res.send("API Running...");
});

// ======================================
// SERVER START
// ======================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`);

  // Start cron jobs after server is up
  startAllCronJobs();
});
