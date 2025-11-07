// src/components/Courses/CourseList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CourseStyles.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    
    const config = {
        headers :{
            'Authorization': `Token ${localStorage.getItem(`token`)}`,
           },
           withCredentials: true 
    }
    axios.get('http://localhost:8000/api/courses/',config)
      .then(res => {
        console.log("Fetched courses:", res.data); 
        setCourses(res.data);
  })
  .catch(err => console.error('Failed to fetch courses:', err));
 }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Courses</h1>
        <p className="header-subtitle">All courses in the system</p>
      </div>

      <div className="dashboard-content">
      {courses.map(course => (
  <div key={course.id} className="stat-card">
    <div className="stat-details">
      <h3>{course.name}</h3>
      <p>{course.description}</p>
      <p><strong>Credits:</strong> {course.credits}</p>

      {/* ✅ Show average once here */}
      <p><strong>Average Score:</strong> {course.average_score}%</p>

      {course.assessments && course.assessments.length > 0 ? (
        <div className="course-assessments">
          <h4 style={{ marginTop: '1rem' }}>Assessments</h4>
          {course.assessments.map(assessment => (
            <div key={assessment.id} className="assessment-summary">
              <strong>{assessment.title}</strong>
              <p>{assessment.summary}</p>
              <p><strong>Score:</strong> {assessment.score}%</p> {/* Only individual score here */}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ marginTop: '1rem', color: '#999' }}>
          <em>No assessments linked to this course.</em>
        </p>
      )}
    </div>
  </div>
))}
      </div>
    </div>
  );
};

export default CourseList;
