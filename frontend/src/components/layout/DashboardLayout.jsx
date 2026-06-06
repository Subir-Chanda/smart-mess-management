import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import LockBanner from "./LockBanner";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh" }}>
      {/* SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* OVERLAY for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          className="sidebar-overlay"
        />
      )}

      {/* MAIN CONTENT */}
      <div className="main-content">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <LockBanner />
        <div
          style={{
            padding: "20px",
            width: "100%",
            boxSizing: "border-box",
            overflowX: "auto",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
