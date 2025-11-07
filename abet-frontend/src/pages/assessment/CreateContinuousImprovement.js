// src/pages/assessment/CreateContinuousImprovement.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./DetailPage.css";

const CreateContinuousImprovement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const assessmentId = searchParams.get("assessment_id");

  const [formData, setFormData] = useState({
    action_taken: "",
    implementation_date: "",
    effectiveness_measure: "",
    weight: "",
    score: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!assessmentId) {
      setError("Assessment ID is missing");
      return;
    }

    try {
      const payload = {
        action_taken: formData.action_taken.trim(),
        implementation_date: formData.implementation_date,
        effectiveness_measure: formData.effectiveness_measure.trim(),
        weight: parseInt(formData.weight), // ✅ Convert to number
        score: parseFloat(formData.score), // ✅ Convert to number
        assessment: parseInt(assessmentId), // ✅ Convert to number
      };

      console.log("🔍 Sending payload:", payload);

      const response = await api.post("/continuous-improvements/", payload);
      console.log("✅ Success response:", response.data);

      navigate(`/assessments/${assessmentId}`);
    } catch (err) {
      console.error("❌ Full error:", err);
      console.error("❌ Response data:", err.response?.data);
      setError(
        err.response?.data?.detail ||
          "Failed to create Continuous Improvement. Please check all fields."
      );
    }
  };

  return (
    <div className="detail-page">
      <h1>Create Continuous Improvement</h1>
      {error && <p className="detail-error">{error}</p>}
      <form onSubmit={handleSubmit} className="detail-card">
        <label>
          Action Taken:
          <textarea
            name="action_taken"
            value={formData.action_taken}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Implementation Date:
          <input
            type="date"
            name="implementation_date"
            value={formData.implementation_date}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Effectiveness Measure:
          <textarea
            name="effectiveness_measure"
            value={formData.effectiveness_measure}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Score:
          <input
            type="number"
            step="0.1"
            name="score"
            value={formData.score}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Weight:
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="btn primary">
          Create
        </button>
      </form>
    </div>
  );
};

export default CreateContinuousImprovement;
