import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AssessmentList.css';
import { MdAssessment } from 'react-icons/md';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/assessments/');
        const fetched = (response.data.results || response.data).map(a => ({
          ...a,
          id: a.id || a.Assessment,
        }));
        setAssessments(fetched);

        const scoreResults = await Promise.all(
          fetched.map((a) => api.get(`/assessments/${a.id}/calculate-score/`))
        );

        const scoreMap = {};
        scoreResults.forEach((res, index) => {
          scoreMap[fetched[index].id] = res.data.total_score;
        });

        setScores(scoreMap);
      } catch (err) {
        console.error('Error fetching assessments:', err.response?.data || err.message);
        setError('Failed to load assessments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) return <div className="assessment-list loading">Loading assessments...</div>;
  if (error) return <div className="assessment-list error-message">{error}</div>;

  return (
      <div className="assessment-list dashboard">
            <div className="centered-header">
                <div className="header-content">
                  <MdAssessment className="header-icon" />
                    <h1>Assessment Records</h1>
                  </div>
                <Link to="/assessments/new" className="btn primary">Create New Assessment</Link>
              <p className="header-subtitle">Browse and review submitted ABET assessments.</p>
            </div>

      {assessments.length === 0 ? (
        <p className="empty-state">No assessments found. Start by creating one.</p>
      ) : (
        <div className="grid-cards">
          {assessments.map((assessment) => (
            <div className="assessment-card" key={assessment.id}>
              <h3>{assessment.name}</h3>
              <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
              <p><strong>Course:</strong> {assessment.course}</p>
              <p><strong>Score:</strong> {scores[assessment.id]?.toFixed(2) ?? 'Calculating...'}</p>
              <Link to={`/assessments/${assessment.id}`} className="btn secondary">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
