// src/components/modals/AddQuestionModal.js - FINAL VERSION

import React, { useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import api from "../../services/api";
import "./AddQuestionModal.css";

const AddQuestionModal = ({
  isOpen,
  onClose,
  onSaveSuccess,
  courseId,
  initialData,
}) => {
  // This state holds the data for the form fields
  const [formData, setFormData] = useState({
    question_no: "",
    question_text: "",
    weight: "",
    academic_performance: "",
  });

  const [selectedOutcomes, setSelectedOutcomes] = useState([]);
  const [academicPerformances, setAcademicPerformances] = useState([]);
  const [outcomeOptions, setOutcomeOptions] = useState([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData; // A clearer way to check for edit mode

  // --- CHANGE 1: This useEffect now correctly populates the form for editing ---
  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        // If editing, set the form state with the data from the selected question
        setFormData({
          question_no: initialData.question_no || "",
          question_text: initialData.question_text || "",
          weight: initialData.weight || "",
          academic_performance: initialData.academic_performance || "",
        });
        // Also set the state for the multi-select dropdown
        const initialSelectedOutcomes =
          initialData.mapped_outcomes?.map((o) => ({
            label: o.label,
            value: o.id,
          })) || [];
        setSelectedOutcomes(initialSelectedOutcomes);
      } else {
        // If adding, reset the form to be empty
        setFormData({
          question_no: "",
          question_text: "",
          weight: "",
          academic_performance: "",
        });
        setSelectedOutcomes([]);
      }

      // Fetch data for the dropdowns (Exams and Outcomes)
      const fetchDataForDropdowns = async () => {
        try {
          const [examsResponse, abetOutcomesResponse] = await Promise.all([
            api.get(`/academic-performances/?course=${courseId}`),
            api.get("/abetoutcome/"),
          ]);
          setAcademicPerformances(examsResponse.data);
          const formattedOutcomes = abetOutcomesResponse.data.map((o) => ({
            label: `${o.label} - ${o.description}`,
            value: o.id,
          }));
          setOutcomeOptions(formattedOutcomes);
        } catch (err) {
          console.error("Failed to fetch dropdown data", err);
          setError("Could not load dropdown data.");
        }
      };
      fetchDataForDropdowns();
    }
  }, [isOpen, initialData, courseId]); // This hook re-runs whenever the modal opens or the data changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      course: courseId,
      question_no: Number(formData.question_no),
      question_text: formData.question_text,
      weight: Number(formData.weight),
      academic_performance: formData.academic_performance,
      mapped_outcomes_ids: selectedOutcomes.map((o) => o.value),
    };

    try {
      if (isEditMode) {
        await api.put(`/assessment-questions/${initialData.id}/`, payload);
      } else {
        await api.post("/assessment-questions/", payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to save question:", err.response?.data);
      setError(JSON.stringify(err.response?.data) || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* --- CHANGE 2: The title is now dynamic --- */}
        <h2>
          {isEditMode
            ? "Edit Assessment Question"
            : "Add New Assessment Question"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* --- CHANGE 3: All form fields now use 'value' instead of 'defaultValue' --- */}
          <div className="form-group">
            <label htmlFor="question_no">Question Number</label>
            <input
              type="number"
              id="question_no"
              name="question_no"
              value={formData.question_no}
              onChange={handleInputChange}
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="question_text">Question Text</label>
            <textarea
              id="question_text"
              name="question_text"
              value={formData.question_text}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight">Weight (%)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="academic_performance">Exam</label>
            <select
              id="academic_performance"
              name="academic_performance"
              value={formData.academic_performance}
              onChange={handleInputChange}
              required
            >
              <option value="">-- Select an Exam --</option>
              {academicPerformances.map((ap) => (
                <option key={ap.id} value={ap.id}>
                  {ap.assessmentType}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="learning_outcomes">Student Outcomes</label>
            <MultiSelect
              options={outcomeOptions}
              value={selectedOutcomes}
              onChange={setSelectedOutcomes}
              labelledBy="Select Outcomes"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestionModal;
