// src/pages/assessment/AssessmentDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const assessmentResponse = await api.get(`/assessments/${id}/`);
        setAssessment(assessmentResponse.data);
        
        const resultsResponse = await api.get(`/assessment-results/?assessment=${id}`);
        setResults(resultsResponse.data);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch assessment details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchAssessmentData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await api.delete(`/assessments/${id}/`);
        navigate('/assessments');
      } catch (err) {
        setError('Failed to delete assessment');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading assessment details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!assessment) return <div>Assessment not found</div>;

  return (
    <div className="assessment-detail">
      <div className="assessment-header">
        <h2>{assessment.name}</h2>
        <div className="assessment-actions">
          <Link to={`/assessments/${id}/edit`} className="btn-edit">Edit</Link>
          <button onClick={handleDelete} className="btn-delete">Delete</button>
        </div>
      </div>
      
      <div className="assessment-info">
        <p><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
        <p><strong>Program:</strong> {assessment.program}</p>
      </div>
      
      <div className="assessment-outcomes">
        <h3>Learning Outcomes</h3>
        {/* Display learning outcomes here */}
      </div>
      
      <div className="assessment-results">
        <h3>Results</h3>
        {results.length === 0 ? (
          <p>No results recorded for this assessment.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result.id}>
                  <td>{result.student}</td>
                  <td>{result.grade}</td>
                  <td>{new Date(result.date).toLocaleDateString()}</td>
                  <td>{result.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <Link to={`/assessments/${id}/results/new`} className="btn-add">Add Result</Link>
      </div>
      
      <Link to="/assessments" className="btn-back">Back to Assessments</Link>
    </div>
  );
};

export default AssessmentDetail;
