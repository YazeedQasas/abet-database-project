import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

import './AssessmentDetail.css';

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [continuousImprovements, setContinuousImprovements] = useState([]);
  const [academicPerformances, setAcademicPerformances] = useState([]);
  const [learningOutcomes, setLearningOutcomes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assessmentRes = await api.get(`/assessments/${id}/`);
        const ciRes = await api.get(`/continuous-improvements/?assessment_id=${id}`);
        const apRes = await api.get(`/academic-performances/?assessment_id=${id}`);
        const loRes = await api.get(`/learning-outcomes/?assessment_id=${id}`);

        setAssessment(assessmentRes.data);
        setContinuousImprovements(ciRes.data);
        setAcademicPerformances(apRes.data);
        setLearningOutcomes(loRes.data);

        
      } catch (err) {
        console.error(err);
        setError('Failed to fetch assessment data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await api.delete(`/assessments/${id}/`);
        navigate('/assessments');
      } catch (err) {
        console.error(err);
        setError('Failed to delete assessment.');
      }
    }
  };

  if (loading) return <div className="assessment-detail loading">Loading assessment...</div>;
  if (error) return <div className="assessment-detail error">{error}</div>;

  return (
    <div className="assessment-detail">
      <div className="dashboard-header">
        <div className="header-info">
          <h1>{assessment.name}</h1>
          <p className="meta"><strong>Date:</strong> {new Date(assessment.date).toLocaleDateString()}</p>
        </div>
        <div className="action-buttons">
          <button onClick={handleDelete} className="btn danger">Delete</button>
        </div>
      </div>


      <div className="grid-layout">
        <div className="card">
          <div className="card-header">
            <h2>Continuous Improvements</h2>
            <Link to={`/continuous-improvements/new?assessment_id=${id}`} className="btn secondary">Add</Link>
          </div>
          {continuousImprovements.length === 0 ? <p>No entries yet.</p> : (
            <ul>
              {continuousImprovements.map(ci => (
                <li key={ci.id} className="clickable-entry" onClick={() => navigate(`/continuous-improvements/${ci.id}`)}>
                  <strong>Action Taken:</strong> {ci.action_taken.slice(0, 80)}...<br />
                  <strong>Effectiveness:</strong> {ci.effectiveness_measure.slice(0, 80)}...<br />
                  <strong>Score:</strong> {ci.score} | <strong>Weight:</strong> {ci.weight}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Academic Performance</h2>
            <Link to={`/assessments/${assessment.id}/academic-performance/new`} className="btn secondary">
              Add
            </Link>
          </div>
          {academicPerformances.length === 0 ? <p>No entries yet.</p> : (
            <ul>
              {academicPerformances.map(ap => (
                <li key={ap.id} className="clickable-entry" onClick={() => navigate(`/academic-performances/${ap.id}`)}>
                  <strong>Type:</strong> {ap.assessmentType} | <strong>Grade:</strong> {ap.grade}<br />
                  <strong>Mean:</strong> {ap.mean} | <strong>High:</strong> {ap.high} | <strong>Low:</strong> {ap.low}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Learning Outcomes</h2>
            <Link to={`/learning-outcomes/new?assessment_id=${id}`} className="btn secondary">Add</Link>
          </div>
          {learningOutcomes.length === 0 ? <p>No outcomes yet.</p> : (
            <ul>
              {learningOutcomes.map(lo => (
                <li key={lo.AssesssmentLearningOutcome_id} className="clickable-entry" onClick={() => navigate(`/learning-outcomes/${lo.AssesssmentLearningOutcome_id}`)}>
                  <strong>Description:</strong> {lo.description.slice(0, 120)}...
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link to="/assessments" className="btn back">← Back to Assessments</Link>
    </div>
  );
};

export default AssessmentDetail;
