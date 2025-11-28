// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaCheck,
  FaExclamationTriangle,
  FaTrash,
} from "react-icons/fa";
import axios from "axios";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    username: "",
    user_id: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    user_type: "faculty",
    department: "",
    title: "Dr.",
  });

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8001/api/departments/",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/users/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });

      console.log("API Response:", response.data);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]); // Set empty array on error
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "department" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.password !== formData.password2) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      setLoading(false);
      return;
    }

    try {
      // Prepend title to first name if selected
      const submissionData = {
        ...formData,
        first_name: formData.title && formData.title !== "None"
          ? `${formData.title} ${formData.first_name}`
          : formData.first_name
      };

      const response = await axios.post(
        "http://localhost:8001/api/auth/register/",
        submissionData,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({ type: "success", text: "User created successfully!" });
      setFormData({
        username: "",
        user_id: "",
        email: "",
        password: "",
        password2: "",
        first_name: "",
        last_name: "",
        user_type: "faculty",
        department: "",
        title: "Dr.",
      });

      // Refresh the user list
      setTimeout(() => {
        fetchUsers();
      }, 500);
    } catch (error) {
      console.error("Registration error:", error);
      const errors = error.response?.data || {};
      const errorMessage =
        Object.entries(errors)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n") || "User creation failed.";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) {
      try {
        await axios.delete(`http://localhost:8001/api/users/${userId}/`, {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        });
        setMessage({ type: "success", text: "User deleted successfully!" });
        fetchUsers();
      } catch (error) {
        console.error("Delete error:", error);
        setMessage({ type: "error", text: "Failed to delete user." });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      user_id: "",
      email: "",
      password: "",
      password2: "",
      first_name: "",
      last_name: "",
      user_type: "faculty",
      department: "",
      title: "Dr.",
    });
    setMessage({ type: "", text: "" });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <h1>Admin Dashboard</h1>
            <p>Manage users and system settings</p>
          </div>
        </div>
      </header>

      <main className="admin-main-content">
        {/* User Creation Section */}
        <section className="user-creation-section">
          <h2>
            <FaUserPlus />
            Create New User
          </h2>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.type === "success" ? (
                <FaCheck />
              ) : (
                <FaExclamationTriangle />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="user_id">User ID (Manual)</label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., ID123"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="title">Title</label>
                <select
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Dr.">Dr.</option>
                  <option value="Prof.">Prof.</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="user_type">User Type</label>
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="professor">Professor</option>
                  <option value="HoD">Head of Department</option>
                  <option value="dean">Dean</option>
                  <option value="evaluator">Program Evaluator</option>
                  <option value="admin">Admin</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password2">Confirm Password</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Reset Form
              </button>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Creating..." : "Create User"}
              </button>
            </div>
          </form>
        </section>

        {/* User Management Section */}
        <section className="user-management-section">
          <div className="section-header">
            <h2>
              <FaUsers />
              User Management
            </h2>
          </div>

          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>User Type</th>
                  <th>Department</th>
                  <th>Date Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>
                      {user.first_name} {user.last_name}
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-type-badge ${user.user_type}`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td>{user.department_name || "N/A"}</td>
                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="action-btn danger"
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        title="Delete User"
                        style={{ padding: "0.5rem", color: "white", background: "#e53e3e", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
