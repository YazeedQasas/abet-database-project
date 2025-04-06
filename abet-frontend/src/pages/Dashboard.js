import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import assessmentService from '../services/assessmentService';
import './Dashboard.css';
import { 
  FaUniversity, 
  FaBuilding, 
  FaBook, 
  FaClipboardList,
  FaChartLine,
  FaCheckCircle
} from 'react-icons/fa';
import { 
  MdAddCircleOutline, 
  MdAssessment, 
  MdOutlineReport,
  MdDashboard
} from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState({
    programs: 0,
    departments: 0,
    courses: 0,
    assessments: 0,
  });
  const [compliancePercentage, setCompliancePercentage] = useState(null);
  const [complianceColor, setComplianceColor] = useState('#808080');
  const [abetAssessments, setAbetAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, complianceRes, abetRes] = await Promise.all([
          api.get('dashboard-stats/'),
          api.get('compliance-data/'),
          assessmentService.getAssessments(),
        ]);

        setStats({
          programs: statsRes.data.programs || 0,
          departments: statsRes.data.departments || 0,
          courses: statsRes.data.courses || 0,
          assessments: statsRes.data.assessments || 0,
        });

        setAbetAssessments(abetRes.data);

        if (abetRes.data.length > 0) {
          const assessment = await assessmentService.getAssessment(abetRes.data[0].id);
          setSelectedAssessment(assessment.data);
        }

        const complianceScore = complianceRes.data.compliance_percentage || 0;
        setCompliancePercentage(complianceScore);
        setComplianceColor(getComplianceColor(complianceScore));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getComplianceColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FFC107'; // Amber
    return '#F44336'; // Red
  };

  const getComplianceStatus = (percentage) => {
    if (percentage >= 80) return 'Meeting Standard';
    if (percentage >= 60) return 'Needs Improvement';
    return 'At Risk';
  };

  const handleAssessmentChange = async (assessmentId) => {
    try {
      const response = await assessmentService.getAssessment(assessmentId);
      setSelectedAssessment(response.data);
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loader"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <MdDashboard className="header-icon" />
          <h1>ABET Accreditation Dashboard</h1>
        </div>
        <p className="header-subtitle">Overview of your accreditation progress and key metrics</p>
      </div>

      <div className="dashboard-content">
        {/* Stats Row */}
        <div className="stats-row">
          {[
            { label: 'Programs', value: stats.programs, icon: FaUniversity, color: '#4361ee' },
            { label: 'Departments', value: stats.departments, icon: FaBuilding, color: '#3a0ca3' },
            { label: 'Courses', value: stats.courses, icon: FaBook, color: '#7209b7' },
            { label: 'Assessments', value: stats.assessments, icon: FaClipboardList, color: '#f72585' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
                <Icon size={24} color={color} />
              </div>
              <div className="stat-details">
                <h3>{value}</h3>
                <p>{label}</p>
              </div>
              <Link to={`/${label.toLowerCase()}`} className="stat-link">
                View
              </Link>
            </div>
          ))}
        </div>

        {/* Main Content Area - 2 Columns */}
        <div className="main-content">
          {/* Compliance Card */}
          <div className="compliance-card">
            <div className="card-header">
              <FaChartLine />
              <h2>ABET Compliance Score</h2>
            </div>
            
            <div className="compliance-body">
              <div className="progress-circle-container">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {compliancePercentage !== null && (
                    <path
                      className="circle"
                      strokeDasharray={`${compliancePercentage},100`}
                      style={{ stroke: complianceColor }}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  <text x="18" y="18" className="percentage">
                    {compliancePercentage !== null ? `${Math.round(compliancePercentage)}%` : 'N/A'}
                  </text>
                </svg>
              </div>

              <div className="compliance-details">
                <div className="status-indicator">
                  <div className="status-dot" style={{ backgroundColor: complianceColor }}></div>
                  <span style={{ color: complianceColor }}>
                    {getComplianceStatus(compliancePercentage)}
                  </span>
                </div>
                
                <div className="assessment-selector">
                  <label>Active Assessment:</label>
                  <select
                    onChange={(e) => handleAssessmentChange(e.target.value)}
                    value={selectedAssessment?.id || ''}
                    disabled={abetAssessments.length === 0}
                  >
                    {abetAssessments.map((assessment) => (
                      <option key={assessment.id} value={assessment.id}>
                        {assessment.name} ({new Date(assessment.date_created).toLocaleDateString()})
                      </option>
                    ))}
                    {abetAssessments.length === 0 && (
                      <option value="">No assessments available</option>
                    )}
                  </select>
                </div>
                
                <p className="score-display">
                  <span>ABET Score:</span>
                  <strong>{selectedAssessment?.overall_score?.toFixed(1) || 'N/A'}%</strong>
                </p>
              </div>
            </div>
            
            <div className="compliance-footer">
              <Link to="/assessments" className="btn primary">
                <MdAssessment /> View All Assessments
              </Link>
              <Link to="/reports/generate" className="btn secondary">
                <MdOutlineReport /> Generate Report
              </Link>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="quick-actions-card">
            <div className="card-header">
              <FaCheckCircle />
              <h2>Quick Actions</h2>
            </div>
            
            <div className="actions-grid">
              {[
                { label: 'Add New Program', link: '/programs/new', icon: FaUniversity, color: '#4361ee' },
                { label: 'Add Department', link: '/departments/new', icon: FaBuilding, color: '#3a0ca3' },
                { label: 'Add Course', link: '/courses/new', icon: FaBook, color: '#7209b7' },
                { label: 'Create Assessment', link: '/abet-assessments/new', icon: MdAssessment, color: '#f72585' },
                { label: 'View Reports', link: '/reports', icon: MdOutlineReport, color: '#4CAF50' },
                { label: 'Generate Reports', link: '/reports/generate', icon: MdOutlineReport, color: '#2196F3' },
              ].map(({ label, link, icon: Icon, color }) => (
                <Link key={label} to={link} className="action-tile">
                  <div className="action-icon" style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={24} />
                  </div>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;