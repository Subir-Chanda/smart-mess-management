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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Restore scroll position
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
    {
      name: "Deposits",
      path: "/dashboard/deposits",
      icon: "fa-solid fa-money-bill",
    },
    {
      name: "Make Payment",
      path: "/dashboard/payment",
      icon: "fa-solid fa-qrcode",
    },
    {
      name: "PDF Reports",
      path: "/dashboard/pdf-reports",
      icon: "fa-solid fa-file-pdf",
    },
  ];

  const mealMenus = [
    {
      name: "Meal Khata",
      path: "/dashboard/meal-khata",
      icon: "fa-solid fa-book",
    },
    {
      name: "Meal Status",
      path: "/dashboard/meal-status",
      icon: "fa-solid fa-toggle-on",
    },
    {
      name: "Bazaar Ledger",
      path: "/dashboard/bazaar",
      icon: "fa-solid fa-cart-shopping",
    },
    {
      name: "Guest Meal Rates",
      path: "/dashboard/guest-meal-rates",
      icon: "fa-solid fa-money-bill-wave",
    },
    {
      name: "Guest Meal Logs",
      path: "/dashboard/guest-meals",
      icon: "fa-solid fa-utensils",
    },
    {
      name: "Bazaar Summary",
      path: "/dashboard/bazaar-summary",
      icon: "fa-solid fa-chart-line",
    },
    {
      name: "Rice Management",
      path: "/dashboard/rice-management",
      icon: "fa-solid fa-bowl-rice",
    },
    {
      name: "Gas Management",
      path: "/dashboard/gas-management",
      icon: "fa-solid fa-fire",
    },
    {
      name: "Monthly Calculation",
      path: "/dashboard/monthly-calculation",
      icon: "fa-solid fa-calculator",
    },
  ];

  const fixedMenus = [
    {
      name: "Mashi Management",
      path: "/dashboard/mashi-management",
      icon: "fa-solid fa-users-gear",
    },
    {
      name: "Fixed Cost",
      path: "/dashboard/fixed-cost",
      icon: "fa-solid fa-file-invoice-dollar",
    },
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
    gap: "15px",
    textDecoration: "none",
    color: "white",
    padding: "14px 18px",
    borderRadius: "14px",
    background: location.pathname === path ? "#374151" : "transparent",
    transition: "0.2s",
    fontSize: "17px",
    fontWeight: "600",
  });

  const subLinkStyle = (path) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textDecoration: "none",
    color: "white",
    padding: "11px 15px",
    borderRadius: "10px",
    background: location.pathname === path ? "#475569" : "#334155",
    fontWeight: "500",
    fontSize: "15px",
    transition: "0.2s",
  });

  const groupHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    borderRadius: "14px",
    background: "#1e293b",
    cursor: "pointer",
    marginTop: "10px",
    fontSize: "17px",
    fontWeight: "600",
    color: "white",
    border: "none",
    width: "100%",
    textAlign: "left",
  };

  return (
    <>
      {/* OVERLAY — mobile only */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "none",
          }}
          className="sidebar-overlay"
        />
      )}

      {/* SIDEBAR */}
      <div
        ref={sidebarRef}
        onScroll={handleSidebarScroll}
        className={`sidebar ${isOpen ? "sidebar-open" : ""}`}
        style={{
          width: "280px",
          minWidth: "280px",
          height: "100vh",
          background: "#02112b",
          color: "white",
          padding: "20px 15px",
          position: "fixed",
          left: 0,
          top: 0,
          overflowY: "auto",
          zIndex: 1000,
          scrollbarGutter: "stable",
          transition: "transform 0.3s ease",
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
            right: "16px",
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px 8px",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* TITLE */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: "32px",
            marginTop: "8px",
            fontSize: "30px",
            fontWeight: "bold",
            lineHeight: "38px",
          }}
        >
          {user?.role === "admin" ? "Mess Manager" : "Mess Member"}
        </h1>

        {/* MAIN MENUS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {menus.map((menu) => (
            <Link key={menu.path} to={menu.path} style={linkStyle(menu.path)}>
              <i
                className={menu.icon}
                style={{ minWidth: "20px", fontSize: "18px" }}
              />
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
            <div>
              <i
                className="fa-solid fa-utensils"
                style={{ marginRight: "12px" }}
              />
              Meal Info
            </div>
            <i
              className={
                showMealMenu
                  ? "fa-solid fa-chevron-up"
                  : "fa-solid fa-chevron-down"
              }
            />
          </button>

          {showMealMenu && (
            <div
              style={{
                marginLeft: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {mealMenus.map((menu) => (
                <Link
                  key={menu.path}
                  to={menu.path}
                  style={subLinkStyle(menu.path)}
                >
                  <i className={menu.icon} style={{ width: "16px" }} />
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
            <div>
              <i
                className="fa-solid fa-coins"
                style={{ marginRight: "12px" }}
              />
              Fixed Cost + Mashi
            </div>
            <i
              className={
                showFixedMenu
                  ? "fa-solid fa-chevron-up"
                  : "fa-solid fa-chevron-down"
              }
            />
          </button>

          {showFixedMenu && (
            <div
              style={{
                marginLeft: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {fixedMenus.map((menu) => (
                <Link
                  key={menu.path}
                  to={menu.path}
                  style={subLinkStyle(menu.path)}
                >
                  <i className={menu.icon} style={{ width: "16px" }} />
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
                <div>
                  <i
                    className="fa-solid fa-user-shield"
                    style={{ marginRight: "12px" }}
                  />
                  Admin Panel
                </div>
                <i
                  className={
                    showAdminMenu
                      ? "fa-solid fa-chevron-up"
                      : "fa-solid fa-chevron-down"
                  }
                />
              </button>

              {showAdminMenu && (
                <div
                  style={{
                    marginLeft: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {adminMenus.map((menu) => (
                    <Link
                      key={menu.path}
                      to={menu.path}
                      style={subLinkStyle(menu.path)}
                    >
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
