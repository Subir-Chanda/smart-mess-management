import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import LockBanner from "./LockBanner";

function DashboardLayout({ children }) {
  return (
    <div
      style={{
        background: "#f3f4f6",
      }}
    >
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div
        style={{
          marginLeft: "320px",
          width: "calc(100% - 320px)",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          overflowX: "hidden",
        }}
      >
        {/* NAVBAR */}
        <Navbar />

        {/* LOCK BANNER — shows for all users when month is locked */}
        <LockBanner />

        {/* PAGE CONTENT */}
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
