import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messName = user?.messName || "Mess";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "80px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0px 30px",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      {/* LEFT — Mess Name */}
      <div>
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#111827" }}>
          {messName}
        </h1>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "500", color: "#374151" }}>
          {user?.name}
        </h3>
        <button
          onClick={handleLogout}
          style={{
            background: "#000",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
