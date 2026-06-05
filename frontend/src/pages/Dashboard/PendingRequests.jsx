import { useEffect, useState } from "react";

import axios from "axios";

import toast from "react-hot-toast";

import DashboardLayout from "../../components/layout/DashboardLayout";

function PendingRequests() {
  // =========================
  // STATES
  // =========================

  const [users, setUsers] = useState([]);

  // =========================
  // FETCH USERS
  // =========================

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // =========================
  // GET PENDING USERS
  // =========================

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/member/pending-users",

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setUsers(res.data.users);
    } catch (error) {
      console.log(error);

      toast.error("Failed To Fetch Users");
    }
  };

  // =========================
  // APPROVE USER
  // =========================

  const approveUser = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/member/approve-user/${id}`,

        {},

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      // REFRESH USERS

      fetchPendingUsers();
    } catch (error) {
      console.log(error);

      toast.error("Approve Failed");
    }
  };

  // =========================
  // REJECT USER
  // =========================

  const rejectUser = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/member/reject-user/${id}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success(res.data.message);

      // REFRESH USERS

      fetchPendingUsers();
    } catch (error) {
      console.log(error);

      toast.error("Reject Failed");
    }
  };

  return (
    <DashboardLayout>
      {/* TITLE */}

      <h1
        style={{
          marginBottom: "25px",
        }}
      >
        Pending Requests
      </h1>

      {/* NO USERS */}

      {users.length === 0 && (
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <h2>No Pending Requests</h2>
        </div>
      )}

      {/* USERS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: "20px",
        }}
      >
        {users.map((user) => (
          <div
            key={user._id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0px 0px 10px rgba(0,0,0,0.08)",
            }}
          >
            {/* USER INFO */}

            <h2
              style={{
                marginBottom: "10px",
              }}
            >
              {user.name}
            </h2>

            <p
              style={{
                marginBottom: "10px",
                color: "#555",
              }}
            >
              {user.email}
            </p>

            <p
              style={{
                marginBottom: "20px",
                fontWeight: "bold",
              }}
            >
              Role: {user.role}
            </p>

            {/* BUTTONS */}

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              {/* APPROVE */}

              <button
                onClick={() => approveUser(user._id)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "green",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Approve
              </button>

              {/* REJECT */}

              <button
                onClick={() => rejectUser(user._id)}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  borderRadius: "8px",
                  background: "red",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

export default PendingRequests;
