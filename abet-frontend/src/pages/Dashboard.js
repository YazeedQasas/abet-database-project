// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    programs: 0,
    departments: 0,
    courses: 0,
    assessments: 0,
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const programsRes = await api.get('/programs/');
        const departmentsRes = await api.get('/departments/');
        const coursesRes = await api.get('/courses/');
        const assessmentsRes = await api.get('/assessments/');
        
        setStats({
          programs: programsRes.data.length,
          departments: departmentsRes.data.length,
          courses: coursesRes.data.length,
          assessments: assessmentsRes.data.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="dashboard">
      <h2>ABET Accreditation Dashboard</h2>
      
      <div className="stats-container">
        <div className="stat-card">
          <h3>Programs</h3>
          <p className="stat-number">{stats.programs}</p>
          <Link to="/programs">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Departments</h3>
          <p className="stat-number">{stats.departments}</p>
          <Link to="/departments">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Courses</h3>
          <p className="stat-number">{stats.courses}</p>
          <Link to="/courses">View All</Link>
        </div>
        
        <div className="stat-card">
          <h3>Assessments</h3>
          <p className="stat-number">{stats.assessments}</p>
          <Link to="/assessments">View All</Link>
        </div>
      </div>
      
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <Link to="/programs/new" className="action-button">Add New Program</Link>
          <Link to="/assessments/new" className="action-button">Create Assessment</Link>
          <Link to="/reports/generate" className="action-button">Generate Reports</Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
