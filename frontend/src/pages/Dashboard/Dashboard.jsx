import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/layout/DashboardLayout";

function Dashboard() {
  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [mealRequests, setMealRequests] = useState([]);
  const [guestCost, setGuestCost] = useState(0);
  const [stats, setStats] = useState({
    totalMeals: 0,
    totalExpenses: 0,
    totalDues: 0,
    messFundBalance: 0,
    currentMealRate: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [memberRes, pendingRes, statsRes, paymentRes, mealRes, guestRes, monthlyCalcRes] =
        await Promise.all([
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/member/all-members", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/member/pending-users", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/stats", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/payment/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/meal-request/all", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/guest-meal/total-cost", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/monthly-calculation/current", { headers: { Authorization: `Bearer ${token}` } }),
        ]);

      setMembers(memberRes.data.users || []);
      setPending(pendingRes.data.users || []);
      setPaymentRequests(paymentRes.data.payments || []);
      setMealRequests(mealRes.data.requests || []);
      setGuestCost(guestRes.data.totalCost || 0);
      setStats({
        ...(statsRes.data.stats || {}),
        totalDues: monthlyCalcRes.data.totalDueAmount || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const now = new Date();
  const monthYear = now.toLocaleString("default", { month: "long", year: "numeric" });

  // Main stat cards (list-style like design reference)
  const statCards = [
    {
      label: "Total Expenses",
      sublabel: monthYear,
      value: `₹${stats.totalExpenses}`,
      icon: "fa-solid fa-credit-card",
      iconBg: "#eff6ff",
      iconColor: "#2563eb",
      valueColor: "#111827",
    },
    {
      label: "Mess Fund Balance",
      sublabel: "Available",
      value: `₹${stats.messFundBalance}`,
      icon: "fa-solid fa-piggy-bank",
      iconBg: "#f0fdf4",
      iconColor: "#16a34a",
      valueColor: "#16a34a",
    },
    {
      label: "Meal Rate",
      sublabel: "Per meal this month",
      value: `₹${Number(stats.currentMealRate || 0).toFixed(2)}`,
      icon: "fa-solid fa-utensils",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      valueColor: "#111827",
    },
    {
      label: "Pending Approvals",
      sublabel: "Needs attention",
      value: pending.length,
      icon: "fa-solid fa-circle-exclamation",
      iconBg: "#fff1f2",
      iconColor: "#ef4444",
      valueColor: "#ef4444",
    },
    {
      label: "Payment Requests",
      sublabel: "Awaiting review",
      value: paymentRequests.length,
      icon: "fa-solid fa-money-check-dollar",
      iconBg: "#f0fdfa",
      iconColor: "#0d9488",
      valueColor: "#111827",
    },
    {
      label: "Meal Requests",
      sublabel: "On/off changes",
      value: mealRequests.length,
      icon: "fa-solid fa-bowl-food",
      iconBg: "#fff7ed",
      iconColor: "#f97316",
      valueColor: "#111827",
    },
    {
      label: "Guest Meal Cost",
      sublabel: monthYear,
      value: `₹${guestCost}`,
      icon: "fa-solid fa-user-group",
      iconBg: "#fdf4ff",
      iconColor: "#a855f7",
      valueColor: "#111827",
    },
    {
      label: "Total Dues",
      sublabel: "All members",
      value: `₹${stats.totalDues}`,
      icon: "fa-solid fa-wallet",
      iconBg: "#fdf4ff",
      iconColor: "#7c3aed",
      valueColor: stats.totalDues < 0 ? "#ef4444" : "#111827",
    },
  ];

  // Bottom summary stats
  const summaryStats = [
    { label: "Members", value: members.length, color: "#111827" },
    { label: "Total Meals", value: stats.totalMeals, color: "#111827" },
    { label: "Total Dues", value: `₹${stats.totalDues}`, color: stats.totalDues < 0 ? "#ef4444" : "#16a34a" },
    { label: "Guest Cost", value: `₹${guestCost}`, color: "#111827" },
  ];

  return (
    <DashboardLayout>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "3px" }}>
            {user?.messName} · {monthYear}
          </p>
        </div>
      </div>

      {/* Main card — list of stats */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          overflow: "hidden",
          marginBottom: "16px",
        }}
      >
        {statCards.map((card, i) => (
          <div
            key={card.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: i < statCards.length - 1 ? "1px solid #f3f4f6" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: card.iconBg, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0,
                }}
              >
                <i className={card.icon} style={{ color: card.iconColor, fontSize: "17px" }} />
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{card.label}</div>
                <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{card.sublabel}</div>
              </div>
            </div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: card.valueColor }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Summary bottom stats */}
      <div
        style={{
          background: "white",
          borderRadius: "14px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          overflow: "hidden",
        }}
      >
        {summaryStats.map((s, i) => (
          <div
            key={s.label}
            style={{
              padding: "18px 16px",
              textAlign: "center",
              borderRight: i < summaryStats.length - 1 ? "1px solid #f3f4f6" : "none",
            }}
          >
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "22px", fontWeight: "700", color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
