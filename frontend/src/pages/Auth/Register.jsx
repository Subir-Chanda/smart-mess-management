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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    // role is NOT collected here anymore — determined in PostSignup
  });

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
        formData, // no role sent — backend defaults to member
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
            width: "fit-content",
            maxWidth: "100%",
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
          Register
        </h1>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle("name")}
            />
            {errorBubble("name")}
          </div>

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

            {/* PASSWORD RULES */}
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "#f9f9f9",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px rgba(0,0,0,0.08)",
              }}
            >
              <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
                Password must include:
              </p>
              {[
                [passwordRules.length, "Minimum 5 Characters"],
                [passwordRules.uppercase, "One Uppercase Letter"],
                [passwordRules.number, "One Number"],
                [passwordRules.special, "One Special Character"],
              ].map(([ok, label]) => (
                <p key={label} style={{ color: ok ? "green" : "red" }}>
                  {ok ? "✔" : "✖"} {label}
                </p>
              ))}
            </div>
          </div>

          {/* SUBMIT */}
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
            Register
          </button>
        </form>

        <p style={{ marginTop: "20px", textAlign: "center", fontSize: "15px" }}>
          Already Have Account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
