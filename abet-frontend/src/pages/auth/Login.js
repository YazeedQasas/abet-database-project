import React, { useState, useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./Auth.css";
import aislogo from "../../assets/AISABET.png"; // Import your logo
import { FaArrowLeft } from "react-icons/fa"; // Import back arrow icon

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, setCurrentUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(location.state?.message || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("Attempting login with:", formData.username);
      const response = await api.post("/auth/login/", formData);
      console.log("Login response successful:", response.data);

      const userData = {
        id: response.data.user_id,
        username: response.data.username,
        email: response.data.email,
        userType: response.data.user_type,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
      };

      login(userData, response.data.token);

      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-decorative-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-form-container">
        {/* Back to Home Button */}
        <button
          onClick={handleBackToHome}
          className="back-to-home-btn"
          type="button"
        >
          <FaArrowLeft /> Back to Home
        </button>

        <div className="auth-header">
          <img src={aislogo} alt="ABET Tracker" className="auth-logo" />
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">
            Sign in to your ABET Assessment System account
          </p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
