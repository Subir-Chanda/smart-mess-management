import { useNavigate } from "react-router-dom";

function Navbar({ onMenuClick }) {
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
        height: "70px",
        background: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxSizing: "border-box",
        gap: "12px",
      }}
    >
      {/* LEFT — hamburger (mobile) + mess name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          minWidth: 0,
        }}
      >
        {/* Hamburger — shown only on mobile via CSS */}
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          style={{
            display: "none",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: "6px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#111827",
              margin: "5px 0",
            }}
          />
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#111827",
              margin: "5px 0",
            }}
          />
          <div
            style={{
              width: "24px",
              height: "2px",
              background: "#111827",
              margin: "5px 0",
            }}
          />
        </button>

        <h1
          style={{
            fontSize: "clamp(18px, 4vw, 28px)",
            fontWeight: "bold",
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {messName}
        </h1>
      </div>

      {/* RIGHT — name + logout */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <h3
          style={{
            fontSize: "clamp(13px, 3vw, 17px)",
            fontWeight: "500",
            color: "#374151",
            whiteSpace: "nowrap",
          }}
        >
          {user?.name}
        </h3>
        <button
          onClick={handleLogout}
          style={{
            background: "#000",
            color: "white",
            border: "none",
            padding: "9px 16px",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
