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
        "http://localhost:5000/api/auth/login",
        formData,
      );

      // Save token
      localStorage.setItem("token", res.data.token);

      // Save user — includes messName and messId from updated authController
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login Successful");

      setTimeout(() => {
        // ── If user hasn't set up their mess yet → post-signup ──
        if (res.data.redirectTo === "post-signup") {
          navigate("/post-signup");
          return;
        }
        navigate("/dashboard");
      }, 800);
    } catch (error) {
      console.log(error);

      // ── Pending approval after joining a mess ──
      if (error.response?.status === 403) {
        const msg = error.response?.data?.message || "";

        // Save token if returned (for WaitingApproval page to show mess name)
        if (error.response?.data?.token) {
          localStorage.setItem("token", error.response.data.token);
        }
        if (error.response?.data?.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(error.response.data.user),
          );
        }

        // Check if it's a mess-pending message or old approval message
        if (
          msg.includes("pending admin approval") ||
          msg === "Waiting For Admin Approval"
        ) {
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
    padding: "12px",
    boxSizing: "border-box",
    border: errors[field] ? "2px solid red" : "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
  });

  const errorBubble = (field) =>
    errors[field] ? (
      <div style={{ position: "relative", marginTop: "8px" }}>
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "8px solid #e53935",
            marginLeft: "15px",
          }}
        />
        <div
          style={{
            background: "#e53935",
            color: "white",
            padding: "10px 14px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0px 3px 8px rgba(0,0,0,0.2)",
          }}
        >
          {errors[field]}
        </div>
      </div>
    ) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to right, #ece9e6, #ffffff)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "white",
          padding: "30px",
          borderRadius: "15px",
          overflow: "hidden",
          boxShadow: "0px 0px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "32px",
          }}
        >
          Login
        </h1>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle("email")}
            />
            {errorBubble("email")}
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                boxSizing: "border-box",
                border: errors.password ? "2px solid red" : "1px solid #ccc",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "16px",
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: "pointer", fontSize: "18px" }}
              >
                <i
                  className={
                    showPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                  }
                ></i>
              </span>
            </div>
            {errorBubble("password")}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              boxSizing: "border-box",
              background: "black",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Login
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "15px" }}>
          New User? <Link to="/register">Signup</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
