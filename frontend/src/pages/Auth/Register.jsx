import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerSchema } from "../../utils/authValidation";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const validatePassword = (password) => {
    setPasswordRules({
      length: password.length >= 5,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    if (e.target.name === "password") validatePassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);
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
        (import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/auth/register",
        formData,
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Signup Successful");

      setFormData({ name: "", email: "", password: "" });
      setErrors({});

      setTimeout(() => {
        navigate("/post-signup");
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something Went Wrong");
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
          maxWidth: "420px",
          background: "white",
          padding: "36px 32px",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(37,99,235,0.10)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Create Account
          </h2>
          <p style={{ color: "#f59e0b", fontSize: "13px", marginTop: "6px", fontWeight: "500" }}>
            Join your mess management system
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Subir Chanda"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle("name")}
            />
            {errorBubble("name")}
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="subir@example.com"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle("email")}
            />
            {errorBubble("email")}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "20px" }}>
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

            {/* PASSWORD RULES */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                background: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #f3f4f6",
              }}
            >
              <p style={{ marginBottom: "8px", fontWeight: "700", fontSize: "12px", color: "#374151" }}>
                Password must include:
              </p>
              {[
                [passwordRules.length, "Minimum 5 characters"],
                [passwordRules.uppercase, "One uppercase letter"],
                [passwordRules.number, "One number"],
                [passwordRules.special, "One special character"],
              ].map(([ok, label]) => (
                <p key={label} style={{ color: ok ? "#16a34a" : "#ef4444", fontSize: "12px", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>{ok ? "✔" : "✖"}</span> {label}
                </p>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
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
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "18px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/" style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
