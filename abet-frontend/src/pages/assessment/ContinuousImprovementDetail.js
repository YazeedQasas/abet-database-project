import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './DetailPage.css';

const ContinuousImprovementDetail = () => {
  const { id } = useParams(); // This is the CI ID
  const navigate = useNavigate();
  const [ci, setCi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCI = async () => {
      try {
        const response = await api.get(`/continuous-improvements/${id}/`);
        setCi(response.data);
      } catch (err) {
        setError('Failed to load Continuous Improvement details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCI();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.delete(`/continuous-improvements/${id}/`);
        navigate(-1);
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    }
  };

  if (loading) return <div className="detail-loading">Loading...</div>;
  if (error) return <div className="detail-error">{error}</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <h1>Continuous Improvement Detail</h1>
        <div className="action-buttons">
          <Link to={`/continuous-improvements/${id}/edit`} className="btn primary">Edit</Link>
          <button onClick={handleDelete} className="btn danger">Delete</button>
        </div>
      </div>

      <div className="detail-card">
        <p><strong>Action Taken:</strong> {ci.action_taken}</p>
        <p><strong>Implementation Date:</strong> {new Date(ci.implementation_date).toLocaleDateString()}</p>
        <p><strong>Effectiveness Measure:</strong> {ci.effectiveness_measure}</p>
        <p><strong>Score:</strong> {ci.score}</p>
        <p><strong>Weight:</strong> {ci.weight}</p>
      </div>

      <Link to={`/assessments/${ci.assessment_id}`} className="btn back">← Back to Assessment</Link>
    </div>
  );
};

export default ContinuousImprovementDetail;
