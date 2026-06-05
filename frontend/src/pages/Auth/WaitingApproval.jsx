import { useNavigate } from "react-router-dom";

function WaitingApproval() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        background: "#f3f4f6",
        gap: "12px",
      }}
    >
      <div style={{ fontSize: 48 }}>⏳</div>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>
        Waiting For Admin Approval
      </h1>
      <p style={{ color: "#6b7280", fontSize: 15 }}>
        Your request to join <strong>{user?.messName || "the mess"}</strong> is
        pending.
      </p>
      <p style={{ color: "#6b7280", fontSize: 15 }}>
        Please contact the mess admin.
      </p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 16,
          padding: "10px 24px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Back to Login
      </button>
    </div>
  );
}

export default WaitingApproval;
