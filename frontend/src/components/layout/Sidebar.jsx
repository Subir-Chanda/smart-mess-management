import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const sidebarRef = useRef(null);

  const [showMealMenu, setShowMealMenu] = useState(() => {
    return localStorage.getItem("showMealMenu") !== "false";
  });

  const [showAdminMenu, setShowAdminMenu] = useState(() => {
    return localStorage.getItem("showAdminMenu") === "true";
  });

  const [showFixedMenu, setShowFixedMenu] = useState(() => {
    return localStorage.getItem("showFixedMenu") !== "false";
  });

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    const savedPosition = localStorage.getItem("sidebarScroll");
    if (sidebarRef.current && savedPosition !== null) {
      sidebarRef.current.scrollTop = Number(savedPosition);
    }
  }, [location.pathname]);

  const handleSidebarScroll = () => {
    if (sidebarRef.current) {
      localStorage.setItem("sidebarScroll", sidebarRef.current.scrollTop);
    }
  };

  const menus = [
    { name: "Dashboard", path: "/dashboard", icon: "fa-solid fa-house" },
    { name: "Members", path: "/dashboard/members", icon: "fa-solid fa-users" },
    { name: "Deposits", path: "/dashboard/deposits", icon: "fa-solid fa-money-bill" },
    { name: "Make Payment", path: "/dashboard/payment", icon: "fa-solid fa-qrcode" },
    { name: "PDF Reports", path: "/dashboard/pdf-reports", icon: "fa-solid fa-file-pdf" },
  ];

  const mealMenus = [
    { name: "Meal Khata", path: "/dashboard/meal-khata", icon: "fa-solid fa-book" },
    { name: "Meal Status", path: "/dashboard/meal-status", icon: "fa-solid fa-toggle-on" },
    { name: "Bazaar Ledger", path: "/dashboard/bazaar", icon: "fa-solid fa-cart-shopping" },
    { name: "Guest Meal Rates", path: "/dashboard/guest-meal-rates", icon: "fa-solid fa-money-bill-wave" },
    { name: "Guest Meal Logs", path: "/dashboard/guest-meals", icon: "fa-solid fa-utensils" },
    { name: "Bazaar Summary", path: "/dashboard/bazaar-summary", icon: "fa-solid fa-chart-line" },
    { name: "Rice Management", path: "/dashboard/rice-management", icon: "fa-solid fa-bowl-rice" },
    { name: "Gas Management", path: "/dashboard/gas-management", icon: "fa-solid fa-fire" },
    { name: "Monthly Calculation", path: "/dashboard/monthly-calculation", icon: "fa-solid fa-calculator" },
  ];

  const fixedMenus = [
    { name: "Mashi Management", path: "/dashboard/mashi-management", icon: "fa-solid fa-users-gear" },
    { name: "Fixed Cost", path: "/dashboard/fixed-cost", icon: "fa-solid fa-file-invoice-dollar" },
  ];

  const adminMenus = [
    { name: "Transfer Admin", path: "/dashboard/transfer-admin" },
    { name: "Pending Requests", path: "/dashboard/pending-requests" },
    { name: "Payment Requests", path: "/dashboard/payment-requests" },
    { name: "Meal Requests", path: "/dashboard/meal-requests" },
    { name: "Upload QR", path: "/dashboard/upload-qr" },
    { name: "Monthly Reset", path: "/dashboard/monthly-reset" },
  ];

  const linkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "11px",
    textDecoration: "none",
    color: location.pathname === path ? "#2563eb" : "#374151",
    padding: "9px 12px",
    borderRadius: "8px",
    background: location.pathname === path ? "#eff6ff" : "transparent",
    transition: "0.15s",
    fontSize: "14px",
    fontWeight: location.pathname === path ? "600" : "500",
    borderLeft: location.pathname === path ? "3px solid #2563eb" : "3px solid transparent",
  });

  const subLinkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "9px",
    textDecoration: "none",
    color: location.pathname === path ? "#2563eb" : "#6b7280",
    padding: "7px 10px",
    borderRadius: "6px",
    background: location.pathname === path ? "#eff6ff" : "transparent",
    fontWeight: location.pathname === path ? "600" : "400",
    fontSize: "13px",
    transition: "0.15s",
  });

  const groupHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "6px",
    background: "transparent",
    cursor: "pointer",
    marginTop: "4px",
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ca3af",
    border: "none",
    width: "100%",
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
  };

  const messNameInitials = (user?.messName || "M").charAt(0).toUpperCase();

  return (
    <>
      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        style={{
          width: "220px",
          minWidth: "220px",
          height: "100vh",
          background: "white",
          color: "#374151",
          padding: "0",
          position: "fixed",
          left: 0,
          top: 0,
          overflowY: "auto",
          zIndex: 1000,
          scrollbarGutter: "stable",
          transition: "transform 0.3s ease",
          borderRight: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* CLOSE BUTTON — mobile only */}
        <button
          onClick={onClose}
          className="sidebar-close-btn"
          style={{
            display: "none",
            position: "absolute",
            top: "16px",
            right: "12px",
            background: "transparent",
            border: "none",
            color: "#6b7280",
            fontSize: "20px",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* BRAND HEADER */}
        <div
          style={{
            padding: "16px 16px 14px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px", height: "36px", borderRadius: "9px",
              background: "#2563eb", display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-utensils" style={{ color: "white", fontSize: "15px" }} />
          </div>
          <div>
            <div style={{ fontWeight: "700", fontSize: "14px", color: "#111827", lineHeight: 1.2 }}>
              {user?.messName || "Mess"}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
              {user?.role === "admin" ? "Admin Panel" : "Member Panel"}
            </div>
          </div>
        </div>

        {/* MAIN MENUS */}
        <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
          {menus.map((menu) => (
            <Link key={menu.path} to={menu.path} style={linkStyle(menu.path)}>
              <i className={menu.icon} style={{ minWidth: "16px", fontSize: "14px", color: location.pathname === menu.path ? "#2563eb" : "#9ca3af" }} />
              <span>{menu.name}</span>
            </Link>
          ))}

          {/* MEAL INFO */}
          <button
            onClick={() => {
              const v = !showMealMenu;
              setShowMealMenu(v);
              localStorage.setItem("showMealMenu", v);
            }}
            style={groupHeaderStyle}
          >
            <span>Meal Info</span>
            <i className={showMealMenu ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} style={{ fontSize: "10px" }} />
          </button>

          {showMealMenu && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "4px" }}>
              {mealMenus.map((menu) => (
                <Link key={menu.path} to={menu.path} style={subLinkStyle(menu.path)}>
                  <i className={menu.icon} style={{ width: "14px", fontSize: "12px", color: location.pathname === menu.path ? "#2563eb" : "#9ca3af" }} />
                  <span>{menu.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* FIXED COST + MASHI */}
          <button
            onClick={() => {
              const v = !showFixedMenu;
              setShowFixedMenu(v);
              localStorage.setItem("showFixedMenu", v);
            }}
            style={groupHeaderStyle}
          >
            <span>Fixed Cost + Mashi</span>
            <i className={showFixedMenu ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} style={{ fontSize: "10px" }} />
          </button>

          {showFixedMenu && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "4px" }}>
              {fixedMenus.map((menu) => (
                <Link key={menu.path} to={menu.path} style={subLinkStyle(menu.path)}>
                  <i className={menu.icon} style={{ width: "14px", fontSize: "12px", color: location.pathname === menu.path ? "#2563eb" : "#9ca3af" }} />
                  <span>{menu.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* ADMIN PANEL */}
          {user?.role === "admin" && (
            <>
              <button
                onClick={() => {
                  const v = !showAdminMenu;
                  setShowAdminMenu(v);
                  localStorage.setItem("showAdminMenu", v);
                }}
                style={groupHeaderStyle}
              >
                <span>Admin Panel</span>
                <i className={showAdminMenu ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"} style={{ fontSize: "10px" }} />
              </button>

              {showAdminMenu && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "4px" }}>
                  {adminMenus.map((menu) => (
                    <Link key={menu.path} to={menu.path} style={subLinkStyle(menu.path)} className="admin-submenu">
                      <span>{menu.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
