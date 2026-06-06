import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { loginSchema } from "../../utils/authValidation";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await axios.post(
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/login",
        formData,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful");

      setTimeout(() => {
        if (res.data.redirectTo === "post-signup") {
          navigate("/post-signup");
          return;
        }
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      console.log(error);

      if (error.response?.status === 403) {
        const msg = error.response?.data?.message || "";

        if (error.response?.data?.token) {
          localStorage.setItem("token", error.response.data.token);
        }
        if (error.response?.data?.user) {
          localStorage.setItem("user", JSON.stringify(error.response.data.user));
        }

        if (msg.includes("pending admin approval") || msg === "Waiting For Admin Approval") {
          navigate("/waiting-approval");
        } else {
          toast.error(msg || "Access Denied");
        }
      } else {
        toast.error(error.response?.data?.message || "Login Failed");
      }
    }
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    boxSizing: "border-box",
    border: errors[field] ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
    background: "white",
    color: "#111827",
    transition: "border-color 0.15s",
  });

  const errorBubble = (field) =>
    errors[field] ? (
      <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "5px", marginLeft: "2px" }}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#e8eef7",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          padding: "36px 32px",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(37,99,235,0.10)",
        }}
      >
        {/* Logo + Brand */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "52px", height: "52px", borderRadius: "14px",
              background: "#2563eb", display: "inline-flex", alignItems: "center",
              justifyContent: "center", marginBottom: "14px",
            }}
          >
            <i className="fa-solid fa-utensils" style={{ color: "white", fontSize: "22px" }} />
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
            MessAdmin
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "6px" }}>
            Sign in to your mess account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@blockmess.com"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle("email")}
            />
            {errorBubble("email")}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: errors.password ? "1.5px solid #ef4444" : "1.5px solid #e5e7eb",
                borderRadius: "8px",
                padding: "11px 14px",
                background: "white",
                transition: "border-color 0.15s",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", color: "#111827" }}
              />
              <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>
                <i className={showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"} />
              </span>
            </div>
            {errorBubble("password")}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "13px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "9px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
          >
            Sign In
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
          New User?{" "}
          <Link to="/register" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
