// src/components/FacultyTraining/AddTraining.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AddTraining.css";
import axios from "axios";

const AddTraining = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    training_type: "",
    faculty: "", // Change from faculty_id to faculty
    academic_year: "2024-2025",
    is_completed: false, // Change from 0 to false (boolean)
    completion_date: null,
  });

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("=== FORM STATE DEBUG ===");
    console.log("Current formData:", formData);
    console.log("Available faculties:", faculties);
  }, [formData, faculties]);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      console.log("Fetching faculties from programs_faculty table...");
      // Use the Faculty endpoint instead of users
      const response = await axios.get("http://localhost:8001/api/faculty/", {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });

      console.log("Faculty data:", response.data);
      setFaculties(response.data);
    } catch (err) {
      console.error("Error fetching faculties:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // Use boolean for checkbox
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Add these debug lines
    console.log("=== SUBMIT DEBUG ===");
    console.log("Form data being submitted:", formData);
    console.log("Faculty:", formData.faculty, "Type:", typeof formData.faculty);
    console.log(
      "Is completed:",
      formData.is_completed,
      "Type:",
      typeof formData.is_completed
    );
    console.log("Training type:", formData.training_type);
    console.log("Academic year:", formData.academic_year);
    console.log("Completion date:", formData.completion_date);

    try {
      const submitData = { ...formData };

      // Remove completion_date entirely if it's empty
      if (!formData.completion_date || formData.completion_date === "") {
        delete submitData.completion_date;
      }

      const response = await axios.post(
        "http://localhost:8001/api/faculty-training/",
        submitData,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Training added successfully!");
      navigate("/faculty-training");
    } catch (err) {
      alert(`Failed to add training: ${JSON.stringify(err.response?.data)}`);
    } finally {
      setLoading(false);
    }
  };

  const trainingTypes = [
    "ABET Assessment Training",
    "Curriculum Development Workshop",
    "Student Outcome Evaluation",
    "Continuous Improvement Methods",
    "Assessment Data Collection",
    "Rubric Development",
    "Program Review Process",
    "Accreditation Standards",
  ];

  return (
    <div className="add-training-container">
      <div className="form-header">
        <h1>Add New Faculty Training</h1>
        <button
          className="back-btn"
          onClick={() => navigate("/faculty-training")}
        >
          ← Back to Training List
        </button>
      </div>

      <form onSubmit={handleSubmit} className="training-form">
        <div className="form-group">
          <label htmlFor="training_type">Training Type *</label>
          <select
            id="training_type"
            name="training_type"
            value={formData.training_type}
            onChange={handleChange}
            required
          >
            <option value="">Select Training Type</option>
            {trainingTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="faculty">Faculty Member *</label>
          <select
            id="faculty"
            name="faculty" // Change from faculty_id to faculty
            value={formData.faculty}
            onChange={handleChange}
            required
          >
            <option value="">Select Faculty Member</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name} ({faculty.email}) - {faculty.department}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="academic_year">Academic Year *</label>
          <select
            id="academic_year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            required
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
            <option value="2025-2026">2025-2026</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="is_completed"
              checked={formData.is_completed === true} // Boolean check
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Mark as completed
          </label>
        </div>

        {formData.is_completed === true && ( // Change from === 1 to === true
          <div className="form-group">
            <label htmlFor="completion_date">Completion Date</label>
            <input
              type="date"
              id="completion_date"
              name="completion_date"
              value={formData.completion_date}
              onChange={handleChange}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/faculty-training")}
          >
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Training"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTraining;
