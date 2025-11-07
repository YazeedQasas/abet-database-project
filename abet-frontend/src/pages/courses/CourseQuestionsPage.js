// src/pages/courses/CourseQuestionsPage.js - FINAL INTEGRATED VERSION

import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import "./CourseQuestionsPage.css";
// Make sure this path is correct for your project structure
import AddQuestionModal from "./AddQuestionModal";

const CourseQuestionsPage = () => {
  const { courseCode } = useParams();
  const { currentUser } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // --- CHANGE 1: Wrap the data fetching logic in useCallback and use a finally block ---
  const fetchCourseData = useCallback(async () => {
    if (!currentUser || !courseCode) {
      setError("User not authenticated or course code is missing.");
      setLoading(false); // Ensure loading stops if prerequisites aren't met
      return;
    }

    setLoading(true); // Set loading to true right before the API call

    try {
      const [courseResponse, questionsResponse] = await Promise.all([
        api.get(`/courses/${courseCode}/`),
        api.get(`/assessment-questions/?course_code=${courseCode}`),
      ]);
      setCourse(courseResponse.data);
      setQuestions(questionsResponse.data);
      setError(null); // Clear any previous errors on success
    } catch (err) {
      console.error("Failed to fetch course data:", err);
      setError(
        "Could not load data for this course. Please check the console for details."
      );
    } finally {
      // This 'finally' block is GUARANTEED to run, fixing the "stuck on loading" issue.
      setLoading(false);
    }
  }, [courseCode, currentUser]);

  // --- CHANGE 2: The useEffect hook is now cleaner ---
  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handler to open the modal for adding a new question
  const handleAddNew = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  // Handler to open the modal for editing an existing question
  const handleEdit = (question) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  // Handler for successful save (both add and edit)
  const handleSaveSuccess = () => {
    fetchCourseData(); // Re-fetch all data to show the latest changes
  };

  // Handler for deleting a question
  const handleDelete = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`/assessment-questions/${questionId}/`);
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      } catch (err) {
        console.error("Failed to delete question:", err);
        setError("Could not delete the question.");
      }
    }
  };

  // --- CHANGE 3: This rendering logic is now robust ---
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <>
      <div className="course-questions-container">
        <header className="page-header">
          <h1>Assessment Questions for {course?.name || "Course"}</h1>
          <button onClick={handleAddNew} className="add-question-btn">
            + Add New Question
          </button>
        </header>
        <div className="questions-table-container">
          <table className="questions-table">
            <thead>
              <tr>
                <th>Q. No.</th>
                <th>Question Text</th>
                <th>Exam</th>
                <th>Student Outcome</th>
                <th>Weight (%)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>Q{q.question_no}</td>
                  <td>{q.question_text}</td>
                  <td>{q.academic_performance_name || "N/A"}</td>
                  <td>
                    <div className="outcomes-cell">
                      {q.mapped_outcomes?.map((o) => (
                        <span key={o.id} className="outcome-badge">
                          {o.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{q.weight}%</td>
                  <td className="actions-cell">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(q)}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(q.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaveSuccess={handleSaveSuccess}
        courseId={course?.id}
        initialData={editingQuestion}
      />
    </>
  );
};

export default CourseQuestionsPage;
