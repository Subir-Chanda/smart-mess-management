import { useNavigate, Link, useLocation } from "react-router-dom";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const messName = user?.messName || "MessAdmin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const navLinks = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Members", path: "/dashboard/members" },
    { label: "Meals", path: "/dashboard/meal-khata" },
    { label: "Bazaar", path: "/dashboard/bazaar" },
    { label: "Reports", path: "/dashboard/pdf-reports" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        width: "100%",
        height: "58px",
        background: "#2563eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 18px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 100,
        gap: "12px",
        flexShrink: 0,
      }}
    >
      {/* LEFT — hamburger (mobile) + brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        {/* Hamburger — shown only on mobile via CSS */}
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          style={{
            display: "none",
            background: "rgba(255,255,255,0.15)",
            border: "none",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "6px",
            flexShrink: 0,
          }}
        >
          <div style={{ width: "20px", height: "2px", background: "white", margin: "4px 0" }} />
          <div style={{ width: "20px", height: "2px", background: "white", margin: "4px 0" }} />
          <div style={{ width: "20px", height: "2px", background: "white", margin: "4px 0" }} />
        </button>

        {/* Logo icon */}
        <div
          style={{
            width: "34px", height: "34px", borderRadius: "8px",
            background: "white", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}
        >
          <i className="fa-solid fa-utensils" style={{ color: "#2563eb", fontSize: "16px" }} />
        </div>

        <span
          style={{
            color: "white", fontWeight: "700", fontSize: "17px",
            whiteSpace: "nowrap", letterSpacing: "0.3px",
          }}
        >
          {messName}
        </span>

        {/* Nav links — hidden on mobile */}
        <nav className="navbar-links" style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "12px" }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                color: isActive(link.path) ? "white" : "rgba(255,255,255,0.75)",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: isActive(link.path) ? "700" : "500",
                padding: "6px 11px",
                borderRadius: "6px",
                background: isActive(link.path) ? "rgba(255,255,255,0.18)" : "transparent",
                whiteSpace: "nowrap",
                transition: "0.15s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* RIGHT — bell + avatar + name + logout */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        {/* Avatar */}
        <div
          style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "#f59e0b", display: "flex", alignItems: "center",
            justifyContent: "center", color: "white", fontWeight: "700",
            fontSize: "13px", flexShrink: 0,
          }}
        >
          {initials}
        </div>

        <span
          className="navbar-username"
          style={{
            color: "white", fontWeight: "600", fontSize: "14px", whiteSpace: "nowrap",
          }}
        >
          {user?.name}
        </span>

        <button
          onClick={handleLogout}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.35)",
            padding: "6px 14px",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            transition: "0.15s",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
