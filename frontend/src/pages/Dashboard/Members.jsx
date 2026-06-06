import { useEffect, useState } from "react";

import axios from "axios";

import DashboardLayout from "../../components/layout/DashboardLayout";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Members() {
  const [members, setMembers] = useState([]);
  const [confirmId, setConfirmId] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Get logged-in user role from token
  const userRaw = localStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    fetchMembers();
  }, []);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  // ======================================
  // FETCH MEMBERS
  // ======================================

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API}/api/member/all-members`, { headers });
      setMembers(res.data.users);
    } catch (error) {
      console.log(error);
    }
  };

  // ======================================
  // REMOVE MEMBER
  // ======================================

  const handleRemove = async (id) => {
    try {
      setRemoving(id);
      const res = await axios.delete(`${API}/api/member/remove-member/${id}`, {
        headers,
      });
      showToast("success", res.data.message);
      setMembers((prev) => prev.filter((m) => m._id !== id));
    } catch (error) {
      showToast(
        "error",
        error.response?.data?.message || "Failed to remove member.",
      );
    } finally {
      setRemoving(null);
      setConfirmId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "8px",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            backgroundColor: toast.type === "success" ? "#16a34a" : "#dc2626",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          {toast.text}
        </div>
      )}

      <div className="khata-container">
        <h1 className="khata-title">Members List</h1>

        <div className="table-wrapper">
          <table className="khata-table">
            <thead>
              <tr>
                <th>Name</th>

                <th>Email</th>

                <th>Role</th>

                <th>Status</th>

                {isAdmin && <th>Action</th>}
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member._id}>
                  <td>{member.name}</td>

                  <td>{member.email}</td>

                  <td>{member.role}</td>

                  <td>{member.status}</td>

                  {isAdmin && (
                    <td style={{ textAlign: "center" }}>
                      {member.role === "admin" ? (
                        <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                          —
                        </span>
                      ) : confirmId === member._id ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <span style={{ fontSize: "12px", color: "#6b7280" }}>
                            Sure?
                          </span>
                          <button
                            onClick={() => handleRemove(member._id)}
                            disabled={removing === member._id}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#dc2626",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              opacity: removing === member._id ? 0.6 : 1,
                            }}
                          >
                            {removing === member._id ? "Removing..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            disabled={removing === member._id}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#e5e7eb",
                              color: "#374151",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(member._id)}
                          style={{
                            padding: "4px 14px",
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            border: "1px solid #fca5a5",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Members;
