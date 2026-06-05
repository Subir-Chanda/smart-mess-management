import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

function Dashboard() {
  // ======================================
  // STATES
  // ======================================

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
  });
  // ======================================
  // FETCH DATA
  // ======================================

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [
        memberRes,
        pendingRes,
        statsRes,
        paymentRes,
        mealRes,
        guestRes,
        monthlyCalcRes,
      ] = await Promise.all([
        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/member/all-members", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/member/pending-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/payment/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),

        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/meal-request/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/guest-meal/total-cost", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(import.meta.env.VITE_API_URL || "http://localhost:5000"/api/monthly-calculation/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
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

  return (
    <DashboardLayout>
      {/* ======================================
          TITLE
      ====================================== */}

      <h1
        style={{
          marginBottom: "25px",
        }}
      >
        Dashboard
      </h1>

      {/* ======================================
          DASHBOARD CARDS
      ====================================== */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",

          gap: "20px",
        }}
      >
        {/* ======================================
            TOTAL MEMBERS
        ====================================== */}

        <div
          style={{
            background: "white",

            padding: "25px",

            borderRadius: "15px",

            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",

                  color: "#555",
                }}
              >
                Total Members
              </h3>

              <h1>{members.length}</h1>
            </div>

            <div
              style={{
                width: "60px",

                height: "60px",

                borderRadius: "50%",

                background: "#2563eb",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "white",

                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
        </div>

        {/* ======================================
            PENDING REQUESTS
        ====================================== */}

        <div
          style={{
            background: "white",

            padding: "25px",

            borderRadius: "15px",

            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",

                  color: "#555",
                }}
              >
                Pending Requests
              </h3>

              <h1>{pending.length}</h1>
            </div>

            <div
              style={{
                width: "60px",

                height: "60px",

                borderRadius: "50%",

                background: "#f59e0b",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "white",

                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-user-clock"></i>
            </div>
          </div>
        </div>

        {/* ======================================
            TOTAL MEALS
        ====================================== */}

        <div
          style={{
            background: "white",

            padding: "25px",

            borderRadius: "15px",

            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",

                  color: "#555",
                }}
              >
                Total Meals
              </h3>

              <h1>{stats.totalMeals}</h1>
            </div>

            <div
              style={{
                width: "60px",

                height: "60px",

                borderRadius: "50%",

                background: "#10b981",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "white",

                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-utensils"></i>
            </div>
          </div>
        </div>

        {/* ======================================
            TOTAL EXPENSES
        ====================================== */}

        <div
          style={{
            background: "white",

            padding: "25px",

            borderRadius: "15px",

            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",

                  color: "#555",
                }}
              >
                Total Expenses
              </h3>

              <h1>₹{stats.totalExpenses}</h1>
            </div>

            <div
              style={{
                width: "60px",

                height: "60px",

                borderRadius: "50%",

                background: "#ef4444",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "white",

                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-money-bill"></i>
            </div>
          </div>
        </div>

        {/* ======================================
            TOTAL DUES
        ====================================== */}

        <div
          style={{
            background: "white",

            padding: "25px",

            borderRadius: "15px",

            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",

                  color: "#555",
                }}
              >
                Total Dues
              </h3>

              <h1>₹{stats.totalDues}</h1>
            </div>

            <div
              style={{
                width: "60px",

                height: "60px",

                borderRadius: "50%",

                background: "#8b5cf6",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "white",

                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-wallet"></i>
            </div>
          </div>
        </div>

        {/* CURRENT MSSS FUND BALACE */}

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#555",
                }}
              >
                Current Mess Fund
              </h3>

              <h1>₹{stats.messFundBalance}</h1>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#059669",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-piggy-bank"></i>
            </div>
          </div>
        </div>

        {/* payment request */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#555",
                }}
              >
                Payment Requests
              </h3>

              <h1>{paymentRequests.length}</h1>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#14b8a6",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-money-check-dollar"></i>
            </div>
          </div>
        </div>

        {/* mela on/off request */}
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#555",
                }}
              >
                Meal Requests
              </h3>

              <h1>{mealRequests.length}</h1>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#f97316",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-utensils"></i>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#555",
                }}
              >
                Guest Meal Cost
              </h3>

              <h1>₹{guestCost}</h1>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#ec4899",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
        </div>
        <div
          style={{
            background: "white",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0px 0px 12px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3
                style={{
                  marginBottom: "15px",
                  color: "#555",
                }}
              >
                Current Meal Rate
              </h3>

              <h1>₹{Number(stats.currentMealRate || 0).toFixed(2)}</h1>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#6366f1",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-calculator"></i>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
