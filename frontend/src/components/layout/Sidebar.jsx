import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Sidebar() {
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

  // ======================================
  // RESTORE SCROLL POSITION
  // ======================================

  useEffect(() => {
    const savedPosition = localStorage.getItem("sidebarScroll");

    if (sidebarRef.current && savedPosition !== null) {
      sidebarRef.current.scrollTop = Number(savedPosition);
    }
  }, [location.pathname]);

  // ======================================
  // SAVE SCROLL POSITION
  // ======================================

  const handleSidebarScroll = () => {
    if (sidebarRef.current) {
      localStorage.setItem("sidebarScroll", sidebarRef.current.scrollTop);
    }
  };

  // ======================================
  // MAIN MENUS
  // ======================================

  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "fa-solid fa-house",
    },

    {
      name: "Members",
      path: "/dashboard/members",
      icon: "fa-solid fa-users",
    },

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

  // ======================================
  // MEAL INFO MENUS
  // ======================================

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

  // ======================================
  // FIXED COST MENUS
  // ======================================

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

  // ======================================
  // ADMIN MENUS
  // ======================================

  const adminMenus = [
    {
      name: "Transfer Admin",
      path: "/dashboard/transfer-admin",
    },

    {
      name: "Pending Requests",
      path: "/dashboard/pending-requests",
    },

    {
      name: "Payment Requests",
      path: "/dashboard/payment-requests",
    },

    {
      name: "Meal Requests",
      path: "/dashboard/meal-requests",
    },

    {
      name: "Upload QR",
      path: "/dashboard/upload-qr",
    },
    { name: "Monthly Reset", path: "/dashboard/monthly-reset" },
  ];

  return (
    <div
      ref={sidebarRef}
      onScroll={handleSidebarScroll}
      style={{
        width: "320px",
        minWidth: "320px",
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
      }}
    >
      {/* TITLE */}

      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "38px",
          fontWeight: "bold",
          lineHeight: "45px",
        }}
      >
        {user?.role === "admin" ? "Mess Manager" : "Mess Member"}
      </h1>

      {/* MAIN MENUS */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {menus.map((menu) => (
          <Link
            key={menu.path}
            to={menu.path}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              textDecoration: "none",
              color: "white",
              padding: "16px 18px",
              borderRadius: "14px",
              background:
                location.pathname === menu.path ? "#374151" : "transparent",
              transition: "0.3s",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            <i
              className={menu.icon}
              style={{
                minWidth: "22px",
                fontSize: "20px",
              }}
            ></i>

            <span>{menu.name}</span>
          </Link>
        ))}

        {/* MEAL INFO */}

        <div
          onClick={() => {
            const value = !showMealMenu;

            setShowMealMenu(value);

            localStorage.setItem("showMealMenu", value);
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 18px",
            borderRadius: "14px",
            background: "#1e293b",
            cursor: "pointer",
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          <div>
            <i
              className="fa-solid fa-utensils"
              style={{
                marginRight: "12px",
              }}
            ></i>
            Meal Info
          </div>

          <i
            className={
              showMealMenu
                ? "fa-solid fa-chevron-up"
                : "fa-solid fa-chevron-down"
            }
          ></i>
        </div>

        {showMealMenu && (
          <div
            style={{
              marginLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {mealMenus.map((menu) => (
              <Link
                key={menu.path}
                to={menu.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                  color: "white",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  background:
                    location.pathname === menu.path ? "#475569" : "#334155",
                  fontWeight: "500",
                  transition: "0.3s",
                }}
              >
                <i
                  className={menu.icon}
                  style={{
                    width: "18px",
                  }}
                ></i>

                <span>{menu.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* FIXED COST + MASHI */}

        <div
          onClick={() => {
            const value = !showFixedMenu;

            setShowFixedMenu(value);

            localStorage.setItem("showFixedMenu", value);
          }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 18px",
            borderRadius: "14px",
            background: "#1e293b",
            cursor: "pointer",
            marginTop: "10px",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          <div>
            <i
              className="fa-solid fa-coins"
              style={{
                marginRight: "12px",
              }}
            ></i>
            Fixed Cost + Mashi
          </div>

          <i
            className={
              showFixedMenu
                ? "fa-solid fa-chevron-up"
                : "fa-solid fa-chevron-down"
            }
          ></i>
        </div>

        {showFixedMenu && (
          <div
            style={{
              marginLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "10px",
            }}
          >
            {fixedMenus.map((menu) => (
              <Link
                key={menu.path}
                to={menu.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  textDecoration: "none",
                  color: "white",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  background:
                    location.pathname === menu.path ? "#475569" : "#334155",
                  fontWeight: "500",
                  transition: "0.3s",
                }}
              >
                <i
                  className={menu.icon}
                  style={{
                    width: "18px",
                  }}
                ></i>

                <span>{menu.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* ADMIN PANEL */}

        {user?.role === "admin" && (
          <>
            <div
              onClick={() => {
                const value = !showAdminMenu;

                setShowAdminMenu(value);

                localStorage.setItem("showAdminMenu", value);
              }}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 18px",
                borderRadius: "14px",
                background: "#1e293b",
                cursor: "pointer",
                marginTop: "10px",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              <div>
                <i
                  className="fa-solid fa-user-shield"
                  style={{
                    marginRight: "12px",
                  }}
                ></i>
                Admin Panel
              </div>

              <i
                className={
                  showAdminMenu
                    ? "fa-solid fa-chevron-up"
                    : "fa-solid fa-chevron-down"
                }
              ></i>
            </div>

            {showAdminMenu && (
              <div
                style={{
                  marginLeft: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                {adminMenus.map((menu) => (
                  <Link
                    key={menu.path}
                    to={menu.path}
                    style={{
                      textDecoration: "none",
                      color: "white",
                      padding: "12px 15px",
                      borderRadius: "10px",
                      background:
                        location.pathname === menu.path ? "#475569" : "#334155",
                      fontWeight: "500",
                      transition: "0.3s",
                    }}
                  >
                    {menu.name}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
