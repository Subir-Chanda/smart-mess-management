import { Navigate } from "react-router-dom";

function AdminRoute({ children }) {
  // =========================
  // GET TOKEN
  // =========================

  const token = localStorage.getItem("token");

  // =========================
  // GET USER
  // =========================

  const userData = localStorage.getItem("user");

  // =========================
  // NO TOKEN
  // =========================

  if (!token) {
    return <Navigate to="/" />;
  }

  // =========================
  // NO USER DATA
  // =========================

  if (!userData) {
    return <Navigate to="/" />;
  }

  // =========================
  // PARSE USER
  // =========================

  const user = JSON.parse(userData);

  // =========================
  // ROLE CHECK
  // =========================

  if (user.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f3f4f6",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "15px",
            boxShadow: "0px 0px 20px rgba(0,0,0,0.1)",
            textAlign: "center",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <div
            style={{
              fontSize: "70px",
              color: "red",
              marginBottom: "20px",
            }}
          >
            <i className="fa-solid fa-ban"></i>
          </div>

          <h1
            style={{
              color: "red",
              marginBottom: "15px",
            }}
          >
            Access Denied
          </h1>

          <p
            style={{
              color: "#555",
              fontSize: "16px",
              lineHeight: "1.6",
            }}
          >
            Only admin users can access this page.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ACCESS GRANTED
  // =========================

  return children;
}

export default AdminRoute;
