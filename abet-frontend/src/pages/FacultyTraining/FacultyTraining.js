// src/components/FacultyTraining/FacultyTraining.js
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./FacultyTraining.css";
import { FaPlus, FaCheck, FaClock, FaUser, FaCalendar } from "react-icons/fa";
import axios from "axios";

const FacultyTraining = () => {
  const { currentUser } = useContext(AuthContext);
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, completed, pending

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8001/api/faculty-training/",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      setTrainings(response.data);
    } catch (err) {
      console.error("Error fetching trainings:", err);
      setError("Failed to load faculty trainings");
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (trainingId) => {
    try {
      await axios.patch(
        `http://localhost:8001/api/faculty-training/${trainingId}/`,
        { is_completed: true },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local state
      setTrainings(
        trainings.map((training) =>
          training.id === trainingId
            ? {
                ...training,
                is_completed: true,
                completion_date: new Date().toISOString().split("T")[0],
              }
            : training
        )
      );
    } catch (err) {
      console.error("Error updating training:", err);
      alert("Failed to update training status");
    }
  };

  const filteredTrainings = trainings.filter((training) => {
    if (filter === "completed") return training.is_completed === true;
    if (filter === "pending") return training.is_completed === false;
    return true;
  });

  const getTrainingStats = () => {
    const total = trainings.length;
    const completed = trainings.filter((t) => t.is_completed === true).length;
    const pending = total - completed;
    const completionRate =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  };

  const stats = getTrainingStats();

  if (loading) {
    return (
      <div className="faculty-training-container">
        <div className="loading-spinner">Loading faculty trainings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="faculty-training-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="faculty-training-container">
      <div className="training-header">
        <div className="header-content">
          <h1>Faculty Training Management</h1>
          <p>
            Track and manage faculty training completion for ABET compliance
          </p>
        </div>
        <div className="header-actions">
          <Link to="/faculty-training/add" className="add-training-btn">
            <FaPlus /> Add New Training
          </Link>
        </div>
      </div>

      {/* Training Statistics */}
      <div className="training-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <FaUser />
          </div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Trainings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheck />
          </div>
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaClock />
          </div>
          <div className="stat-content">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rate">
            <FaCalendar />
          </div>
          <div className="stat-content">
            <h3>{stats.completionRate}%</h3>
            <p>Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="training-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Trainings
          </button>
          <button
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
          <button
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending
          </button>
        </div>
      </div>

      {/* Training List */}
      <div className="training-list">
        {filteredTrainings.length === 0 ? (
          <div className="no-trainings">
            <p>No trainings found for the selected filter.</p>
          </div>
        ) : (
          <div className="training-grid">
            {filteredTrainings.map((training) => (
              <div key={training.id} className="training-card">
                <div className="training-header-card">
                  <h3>{training.training_type}</h3>
                  <span
                    className={`status-badge ${
                      training.is_completed ? "completed" : "pending"
                    }`}
                  >
                    {training.is_completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <div className="training-details">
                  <div className="detail-row">
                    <strong>Faculty:</strong> {training.faculty_name}
                  </div>
                  <div className="detail-row">
                    <strong>Academic Year:</strong> {training.academic_year}
                  </div>
                  {training.completion_date && (
                    <div className="detail-row">
                      <strong>Completed:</strong>{" "}
                      {new Date(training.completion_date).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="training-actions">
                  {training.is_completed === false ? (
                    <button
                      className="finish-btn"
                      onClick={() => markAsCompleted(training.id)}
                    >
                      <FaCheck /> Mark as Finished
                    </button>
                  ) : (
                    <div className="completed-indicator">
                      <FaCheck /> Training Completed
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyTraining;
