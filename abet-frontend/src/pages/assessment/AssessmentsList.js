// src/pages/assessment/AssessmentsList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AssessmentsList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const response = await api.get('/assessments/');
        setAssessments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch assessments');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAssessments();
  }, []);

  if (loading) return <div>Loading assessments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="assessments-list">
      <h2>Assessments</h2>
      <Link to="/assessments/new" className="btn-add">Create New Assessment</Link>
      
      {assessments.length === 0 ? (
        <p>No assessments found. Create your first assessment.</p>
      ) : (
        <table className="assessments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map(assessment => (
              <tr key={assessment.id}>
                <td>{assessment.name}</td>
                <td>{new Date(assessment.date).toLocaleDateString()}</td>
                <td>{assessment.program}</td>
                <td>
                  <Link to={`/assessments/${assessment.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AssessmentsList;
