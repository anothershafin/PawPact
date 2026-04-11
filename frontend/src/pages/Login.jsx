import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/Auth.css";
import { toastError } from "../utils/toast";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      // Send login data to backend
      const { data } = await loginUser(formData);

      // Save user info + token to localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Redirect to home
      navigate("/");
      window.location.reload();
    } catch (err) {
      let message = "Invalid email or password";
      if (!err.response) {
        message =
          err.code === "ERR_NETWORK" || err.message === "Network Error"
            ? process.env.NODE_ENV === "development"
              ? "Cannot reach API. Start the backend (npm run dev in backend) and restart npm start. Dev proxy targets port 5000 by default; if your API uses another port, set REACT_APP_PROXY_TARGET in frontend/.env.development."
              : `Cannot reach API (${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}). Check that the server is running.`
            : err.message || message;
      } else {
        message = err.response?.data?.message || message;
      }
      setError(message);
      toastError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to your PawPact account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-switch-link">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
