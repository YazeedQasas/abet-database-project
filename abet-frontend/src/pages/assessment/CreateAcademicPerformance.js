import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import './AcademicPerformance.css';

const CreateAcademicPerformance = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assessmentType: '',
    high: '',
    mean: '',
    low: '',
    grade: '',
    weight: '',
    course_id: '',
    instructor_id: '',
    description: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/academic-performances/', {
        ...formData,
        assessment_id: assessmentId
      },
      {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`
        }
      }
      
    
    );
      navigate(`/assessments/${assessmentId}`);
    } catch (err) {
      setError('Failed to create academic performance.');
      console.error(err);
    }
  };

  return (
    <div className="assessment-detail">
      <div className="dashboard-header">
        <h1>Create Academic Performance</h1>
        <p>Provide details related to the academic performance for this assessment.</p>
      </div>
      <form className="section" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <input name="assessmentType" placeholder="Assessment Type" onChange={handleChange} required />
        <input name="high" type="number" placeholder="High Score" onChange={handleChange} required />
        <input name="mean" type="number" placeholder="Mean Score" onChange={handleChange} required />
        <input name="low" type="number" placeholder="Low Score" onChange={handleChange} required />
        <input name="grade" type="number" placeholder="Grade" onChange={handleChange} required />
        <input name="weight" type="number" placeholder="Weight" onChange={handleChange} required />
        <input name="course_id" type="number" placeholder="Course ID" onChange={handleChange} required />
        <input name="instructor_id" type="number" placeholder="Instructor ID" onChange={handleChange} required />
        <textarea name="description" placeholder="Performance Description" onChange={handleChange} required />
        <button type="submit" className="btn primary">Create</button>
      </form>
    </div>
  );
};

export default CreateAcademicPerformance;
