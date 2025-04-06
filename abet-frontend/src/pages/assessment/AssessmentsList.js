import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './AssessmentList.css';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/assessments/');
        setAssessments(response.data.results || response.data); // Handle potential paginated response
      } catch (err) {
        console.error('Error fetching assessments:', err.response?.data || err.message);
        setError('Failed to load assessments.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="assessment-list-container">
      <h2>Assessments</h2>
      <Link to="/assessments/new" className="btn-create-assessment">Create New Assessment</Link>
      {assessments.length === 0 ? (
        <p>No assessments found.</p>
      ) : (
        <ul className="assessment-list">
          {assessments.map((assessment) => (
            <li key={assessment.id}>
              <h3>Assessment {assessment.id}</h3>
              <p>Date: {assessment.date}</p>
              <p>Type: {assessment.assessment_type}</p>
              <p>Compliance Score: {assessment.compliance_score?.toFixed(2) || 'N/A'}</p>
              <Link to={`/assessments/${assessment.id}`} className="view-details-link">
                View Details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AssessmentList;