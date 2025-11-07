// src/components/Courses/CourseForm.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './CourseStyles.css';

const CourseForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    credits: '',
    program: '',
  });
  const [programs, setPrograms] = useState([]);
  
  useEffect(() => {

    const token = localStorage.getItem('token');
    const config = {
            headers: {
                   'Authorization': `Token ${localStorage.getItem(`token`)}`,
            },
            withCredentials: true
    }

    axios.get('http://localhost:8000/api/programs/', config)
      .then(res => setPrograms(res.data))
      .catch(err => console.error('Failed to load programs:', err));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/courses/', formData, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'),
          'Content-Type': 'application/json'
        }
      });
      alert('Course created successfully!');
      setFormData({ name: '', description: '', credits: '', program: '' });
    } catch (err) {
      console.error('Failed to create course:', err);
      alert('Error creating course.');
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Add New Course</h1>
        <p className="header-subtitle">Fill out the course information</p>
      </div>

      <form onSubmit={handleSubmit} className="dashboard-content">
        <input name="name" placeholder="Course Name" value={formData.name} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
        <input name="credits" type="number" placeholder="Credits" value={formData.credits} onChange={handleChange} required />
        <select name="program" value={formData.program} onChange={handleChange} required>
          <option value="">Select Program</option>
          {programs.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button type="submit" className="btn primary">Create Course</button>
      </form>
    </div>
  );
};

export default CourseForm;
