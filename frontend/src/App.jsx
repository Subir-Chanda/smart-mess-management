import { BrowserRouter, Routes, Route } from "react-router-dom";

// ======================================
// AUTH PAGES
// ======================================

import Login from "./pages/Auth/Login";

import Register from "./pages/Auth/Register";

import WaitingApproval from "./pages/Auth/WaitingApproval";

// ======================================
// DASHBOARD PAGES
// ======================================

import Dashboard from "./pages/Dashboard/Dashboard";

import PendingRequests from "./pages/Dashboard/PendingRequests";

import Members from "./pages/Dashboard/Members";

import TransferAdmin from "./pages/Dashboard/TransferAdmin";

// ======================================
// KHATA PAGES
// ======================================

import DailyMealKhata from "./pages/Meal/DailyMealKhata";

import DepositLedger from "./pages/Meal/DepositLedger";

import BazaarLedger from "./pages/Meal/BazaarLedger";

import MonthlyCalculation from "./pages/Meal/MonthlyCalculation";

import MakePayment from "./pages/Payment/MakePayment";

import PaymentRequests from "./pages/Payment/PaymentRequests";

import AdminQR from "./pages/Payment/AdminQR";

import MealStatus from "./pages/Meal/MealStatus";

import AdminMealRequests from "./pages/Meal/AdminMealRequests";

import GuestMeals from "./pages/Meal/GuestMeals";

import GuestMealRates from "./pages/Meal/GuestMealRates";

import BazaarSummary from "./pages/Meal/BazaarSummary";

import RiceManagement from "./pages/Meal/RiceManagement";

import GasManagement from "./pages/Meal/GasManagement";

import MashiManagement from "./pages/Meal/MashiManagement";

import FixedCostManagement from "./pages/Meal/FixedCostManagement";

import PdfReports from "./pages/PDF/PdfReports";

import MonthlyReset from "./pages/Meal/MonthlyReset";

import PostSignup from "./pages/Auth/PostSignup";
// ======================================
// ROUTE PROTECTION
// ======================================

import ProtectedRoute from "./routes/ProtectedRoute";

import AdminRoute from "./routes/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ======================================
            AUTH ROUTES
        ====================================== */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/waiting-approval" element={<WaitingApproval />} />
        {/* ======================================
            DASHBOARD
        ====================================== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* ======================================
            PENDING REQUESTS
        ====================================== */}
        <Route
          path="/dashboard/pending-requests"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PendingRequests />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        {/* ======================================
            MEMBERS
        ====================================== */}
        <Route
          path="/dashboard/members"
          element={
            <ProtectedRoute>
              <Members />
            </ProtectedRoute>
          }
        />
        {/* ======================================
            TRANSFER ADMIN
        ====================================== */}
        <Route
          path="/dashboard/transfer-admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <TransferAdmin />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        {/* ======================================
            DAILY MEAL KHATA
        ====================================== */}
        <Route
          path="/dashboard/meal-khata"
          element={
            <ProtectedRoute>
              <DailyMealKhata />
            </ProtectedRoute>
          }
        />
        {/* ======================================
            DEPOSIT LEDGER
        ====================================== */}
        <Route
          path="/dashboard/deposits"
          element={
            <ProtectedRoute>
              <DepositLedger />
            </ProtectedRoute>
          }
        />
        {/* ======================================
            BAZAAR LEDGER
        ====================================== */}
        <Route
          path="/dashboard/bazaar"
          element={
            <ProtectedRoute>
              <BazaarLedger />
            </ProtectedRoute>
          }
        />
        {/* ======================================
            MONTHLY CALCULATION
        ====================================== */}
        <Route
          path="/dashboard/monthly-calculation"
          element={
            <ProtectedRoute>
              <MonthlyCalculation />
            </ProtectedRoute>
          }
        />
        {/* ======================================
    MAKE PAYMENT
====================================== */}
        <Route
          path="/dashboard/payment"
          element={
            <ProtectedRoute>
              <MakePayment />
            </ProtectedRoute>
          }
        />
        {/* ======================================
    PAYMENT REQUESTS
====================================== */}
        <Route
          path="/dashboard/payment-requests"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <PaymentRequests />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        {/* ADMIN QR ROUTE */}

        <Route
          path="/dashboard/upload-qr"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminQR />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/meal-status"
          element={
            <ProtectedRoute>
              <MealStatus />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/meal-requests"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminMealRequests />
              </AdminRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/guest-meals"
          element={
            <ProtectedRoute>
              <GuestMeals />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/guest-meal-rates"
          element={
            <ProtectedRoute>
              <GuestMealRates />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/bazaar-summary"
          element={
            <ProtectedRoute>
              <BazaarSummary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/rice-management"
          element={
            <ProtectedRoute>
              <RiceManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/gas-management"
          element={
            <ProtectedRoute>
              <GasManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/mashi-management"
          element={
            <ProtectedRoute>
              <MashiManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/fixed-cost"
          element={
            <ProtectedRoute>
              <FixedCostManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/pdf-reports"
          element={
            <ProtectedRoute>
              <PdfReports />
            </ProtectedRoute>
          }
        />

        {/* ======================================
            MONTHLY RESET
        ====================================== */}
        <Route
          path="/dashboard/monthly-reset"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <MonthlyReset />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/post-signup" element={<PostSignup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
