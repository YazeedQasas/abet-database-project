import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import assessmentService from '../services/assessmentService';
import './Dashboard.css';
import { FaUniversity, FaBuilding, FaBook, FaClipboardList, FaChartLine, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { MdAssessment, MdOutlineReport, MdDashboard } from 'react-icons/md';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Scatter } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    programs: 0,
    departments: 0,
    courses: 0,
    assessments: 0,
  });

  const chartRef = useRef(null);
  const [averageScore, setAverageScore] = useState(null);
  const [weightedAverage, setWeightedAverage] = useState(null);
  const [componentScores, setComponentScores] = useState(null);
  const [complianceColor, setComplianceColor] = useState('#808080');
  const [abetAssessments, setAbetAssessments] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [evidenceStats, setEvidenceStats] = useState({ direct: 0, indirect: 0 });
  const [loading, setLoading] = useState(true);
  const [assessmentEvents, setAssessmentEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, abetRes, avgRes, evidenceRes, eventsRes] = await Promise.all([
          api.get('dashboard-stats/'),
          assessmentService.getAssessments(),
          api.get('assessments/average-score/'),
          api.get('abet-outcomes/'),
          api.get('assessment-events/')
        ]);

        setStats({
          programs: statsRes.data.programs || 0,
          departments: statsRes.data.departments || 0,
          courses: statsRes.data.courses || 0,
          assessments: statsRes.data.assessments || 0,
        });

        setAverageScore(avgRes.data?.average_score || 0);
        setAbetAssessments(abetRes.data);
        setAssessmentEvents(eventsRes.data);

        const directCount = evidenceRes.data.filter(e => e.evidence_type === 'direct').length;
        const indirectCount = evidenceRes.data.filter(e => e.evidence_type === 'indirect').length;
        setEvidenceStats({ direct: directCount, indirect: indirectCount });

        if (abetRes.data.length > 0) {
          const firstId = abetRes.data[0].id;
          const assessment = await assessmentService.getAssessment(firstId);
          setSelectedAssessment(assessment.data);
          await fetchAssessmentComponents(assessment.data.id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(() => {
      fetchAssessmentEvents();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const refreshDashboard = async () => {
    setLoading(true);
    try {
      const [eventsRes, avgRes, abetRes, statsRes] = await Promise.all([
        api.get('assessment-events/'),
        api.get('assessments/average-score/'),
        assessmentService.getAssessments(),
        api.get('dashboard-stats/')
      ]);
      
      setAssessmentEvents(eventsRes.data);
      setAverageScore(avgRes.data?.average_score || 0);
      setAbetAssessments(abetRes.data);
      setStats({
        programs: statsRes.data.programs || 0,
        departments: statsRes.data.departments || 0,
        courses: statsRes.data.courses || 0,
        assessments: statsRes.data.assessments || 0,
      });
      
      if (selectedAssessment?.id) {
        const updatedAssessment = await assessmentService.getAssessment(selectedAssessment.id);
        setSelectedAssessment(updatedAssessment.data);
        await fetchAssessmentComponents(selectedAssessment.id);
      } else if (abetRes.data.length > 0) {
        const firstId = abetRes.data[0].id;
        const assessment = await assessmentService.getAssessment(firstId);
        setSelectedAssessment(assessment.data);
        await fetchAssessmentComponents(assessment.data.id);
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  
  


  const fetchAssessmentEvents = async () => {
    try {
      const [eventsRes, avgRes, statsRes] = await Promise.all([
        api.get('assessment-events/'),
        api.get('assessments/average-score/'),
        api.get('dashboard-stats/')
      ]);
    
      setAssessmentEvents(eventsRes.data);
      setAverageScore(avgRes.data?.average_score || 0);
      
      // Update stats as well to keep everything in sync
      setStats({
        programs: statsRes.data.programs || 0,
        departments: statsRes.data.departments || 0,
        courses: statsRes.data.courses || 0,
        assessments: statsRes.data.assessments || 0,
      });
    } catch (error) {
      console.error('Error fetching assessment events:', error);
    }
  };

  const fetchAssessmentComponents = async (assessmentId) => {
    if (!assessmentId) return;
    try {
      const scoreResponse = await assessmentService.calculateAssessmentScore(assessmentId);
      const scoreData = scoreResponse.data;
      setWeightedAverage(scoreData.total_score);
      setComplianceColor(getComplianceColor(scoreData.total_score));
      setComponentScores({
        continuousImprovement: scoreData.continuous_improvement_score,
        academicPerformance: scoreData.academic_performance_score,
        learningOutcome: scoreData.learning_outcome_score
      });
    } catch (error) {
      console.error('Error calculating assessment components:', error);
      setWeightedAverage(null);
    }
  };

  const getComplianceColor = (percentage) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return '#FFC107';
    if (percentage >= 70) return '#FF9800';
    return '#F44336';
  };

  const getComplianceStatus = (percentage) => {
    if (percentage >= 90) return 'ABET Accredited';
    if (percentage >= 80) return 'Near Accreditation';
    if (percentage >= 70) return 'Needs Improvement';
    return 'At Risk';
  };

  const handleCreateAssessment = async (assessmentData) => {
    try {
      const response = await assessmentService.createAssessment(assessmentData);
      // Refresh dashboard after creation
      await refreshDashboard();
      return response;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  };

  const handleUpdateAssessment = async (id, data) => {
    try {
      await assessmentService.updateAssessment(id, data);
      // Refresh dashboard after update
      await refreshDashboard();
      // If the updated assessment is currently selected, refresh its details
      if (selectedAssessment?.id === id) {
        const updated = await assessmentService.getAssessment(id);
        setSelectedAssessment(updated.data);
        await fetchAssessmentComponents(id);
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
    }
  };

  const handleAssessmentChange = async (assessmentId) => {
    try {
      const response = await assessmentService.getAssessment(assessmentId);
      setSelectedAssessment(response.data);
      await fetchAssessmentComponents(assessmentId);
      // Also refresh the events to make sure chart is up-to-date
      await fetchAssessmentEvents();
    } catch (error) {
      console.error('Error loading assessment:', error);
    }
  };
  const calculateComponentAverage = (type) => {
    if (!componentScores) return 'N/A';
    switch (type) {
      case 'continuous-improvement': return Math.round(componentScores.continuousImprovement || 0);
      case 'academic-performance': return Math.round(componentScores.academicPerformance || 0);
      case 'learning-outcome': return Math.round(componentScores.learningOutcome || 0);
      default: return 'N/A';
    }
  };

  const getSemester = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    if (month >= 7 && month <= 11) return `Fall ${year}`;
    else if (month >= 0 && month <= 4) return `Spring ${year}`;
    else return `Summer ${year}`;
  };

  const groupEventsBySemester = () => {
    const grouped = {};
    assessmentEvents.forEach(event => {
      const date = new Date(event.timestamp);
      const semester = getSemester(date);
      if (!grouped[semester]) grouped[semester] = [];
      grouped[semester].push({ ...event, date });
    });
    Object.keys(grouped).forEach(semester => {
      grouped[semester].sort((a, b) => a.date - b.date);
    });
    return grouped;
  };

  const prepareChartData = () => {
    const semesters = groupEventsBySemester();
    const colors = {
      'Fall': 'rgb(255, 99, 132)',
      'Spring': 'rgb(54, 162, 235)',
      'Summer': 'rgb(255, 206, 86)'
    };

    const datasets = Object.entries(semesters).map(([semester, events]) => {
      const semesterType = semester.split(' ')[0];
      const eventsByDate = {};
      events.forEach(event => {
        const dateStr = new Date(event.timestamp).toDateString();
        if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
        eventsByDate[dateStr].push(event);
      });

      const dataPoints = [];
      Object.entries(eventsByDate).forEach(([dateStr, dateEvents]) => {
        dateEvents.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        dateEvents.forEach((event, index) => {
          const adjustedDate = new Date(event.timestamp);
          dataPoints.push({
            x: adjustedDate,
            y: parseFloat(event.average_score_at_time).toFixed(2),
            eventType: event.event_type,
            assessmentName: event.assessment_name,
            timestamp: event.timestamp
          });
        });
      });

      dataPoints.sort((a, b) => a.x - b.x);

      const today = new Date().toDateString();
      

      return {
        label: semester,
        data: dataPoints.map(point => ({
          x: point.x,
          y: parseFloat(point.y || 0),
          assessmentName: point.assessmentName,
          eventType: point.eventType,
          timestamp: point.timestamp
        })),
        borderColor: colors[semesterType] || 'rgb(75, 192, 192)',
        backgroundColor: `${colors[semesterType]}33`,
        tension: 0.1,
        pointBackgroundColor: dataPoints.map(point =>
          point.eventType === 'CREATE' ? 'green' :
            point.eventType === 'UPDATE' ? 'blue' : 'red'
        ),
        pointRadius: 6,
        showLine: true,
      };
    });

    return { datasets };
  };

  const allScores = assessmentEvents.map(e => parseFloat(e.score)).filter(s => !isNaN(s));
  const minScore = Math.min(...allScores, 100);
  const maxScore = Math.max(...allScores, 0);

  const eventTypeMap = {
    'CREATE': 'Created',
    'UPDATE': 'Updated',
    'DELETE': 'Deleted'
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        borderWidth: 2,
        tension: 0.3,  // Optional for curved line; set to 0 for straight
      },
      point: {
        radius: 6
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'MMM d, h:mm a'
          }
        },
        title: { display: true, text: 'Date' },
        ticks: {
          maxRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10
        }
      },
      y: {
        beginAtZero: false,
        suggestedMin: Math.max(0, minScore - 10),
        suggestedMax: maxScore + 10,
        title: { display: true, text: 'ABET Score' }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = context.raw;
            const date = new Date(point.timestamp);
            return [
              `Assessment: ${point.assessmentName || 'N/A'}`,
              `Event: ${eventTypeMap[point.eventType] || point.eventType || 'N/A'}`,
              `Overall ABET Score: ${parseFloat(point.y).toFixed(2)}%`,
              `Date: ${date.toLocaleDateString()}`,
              `Time: ${date.toLocaleTimeString()}`
            ];
          }
        }
      },
      legend: { position: 'top' },
      title: { display: true, text: 'Assessment Timeline by Semester' }
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

  const dashboardAPI = {
    refresh: refreshDashboard,
    createAssessment: handleCreateAssessment,
    updateAssessment: handleUpdateAssessment
  };

  const DashboardWithAPI = Dashboard;
  DashboardWithAPI.refreshDashboard = dashboardAPI.refresh;
  DashboardWithAPI.createAssessment = dashboardAPI.createAssessment;
  DashboardWithAPI.updateAssessment = dashboardAPI.updateAssessment;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <MdDashboard className="header-icon" />
          <h1>ABET Accreditation Dashboard</h1>
        </div>
        <p className="header-subtitle">Overview of your accreditation progress and key metrics</p>
        <Link to="/audit-logs" className="btn secondary">
            View Audit Logs
        </Link>
      </div>

      <div className="content-wrapper">
        <div className="dashboard-content">
          <div className="compliance-card">
            <div className="card-header">
              <FaChartLine />
              <h2>Overall Accreditation Progress</h2>
            </div>
            <div className="compliance-body">
              <div className="progress-circle-container">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {averageScore !== null && (
                    <path
                      className="circle"
                      strokeDasharray={`${averageScore},100`}
                      style={{ stroke: getComplianceColor(averageScore) }}
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  <text x="18" y="18" className="percentage">
                    {averageScore !== null ? `${Math.round(averageScore)}%` : 'N/A'}
                  </text>
                </svg>
              </div>
              <div className="compliance-details">
                <p className="status-indicator">
                  <span className="status-dot" style={{ backgroundColor: getComplianceColor(averageScore) }}></span>
                  {getComplianceStatus(averageScore)}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  This reflects the average score across all ABET assessments.
                </p>
              </div>
            </div>
          </div>

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
                <Link to={`/${label.toLowerCase()}`} className="stat-link">View</Link>
              </div>
            ))}
          </div>

          {/* Timeline Chart Card */}
          <div className="timeline-card">
            <div className="card-header">
              <FaHistory />
              <h2>Assessment Timeline</h2>
            </div>
            <div className="timeline-body">
              {assessmentEvents.length > 0 ? (
                <div className="chart-container">
                  <Scatter 
                    key={`chart-${JSON.stringify(assessmentEvents.map(e => `${e.id}-${e.timestamp}-${e.score}`))}`} 
                    data={prepareChartData()} 
                    options={chartOptions} 
                    ref={chartRef}
                  />
                </div>
              ) : (
                <div className="no-data">No assessment events found</div>
              )}
            </div>
          </div>

          <div className="dashboard-lower">
            <div className="compliance-card">
              <div className="card-header">
                <FaChartLine />
                <h2>ABET Assessment Score</h2>
              </div>
              <div className="compliance-body">
                <div className="progress-circle-container">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path className="circle-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
                    {weightedAverage !== null && (
                      <path
                        className="circle"
                        strokeDasharray={`${weightedAverage},100`}
                        style={{ stroke: complianceColor }}
                        d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    )}
                    <text x="18" y="18" className="percentage">
                      {weightedAverage !== null ? `${Math.round(weightedAverage)}%` : 'N/A'}
                    </text>
                  </svg>
                </div>

                <div className="compliance-details">
                  <div className="status-indicator">
                    <div className="status-dot" style={{ backgroundColor: complianceColor }}></div>
                    <span style={{ color: complianceColor }}>{getComplianceStatus(weightedAverage)}</span>
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
                          {assessment.name} ({new Date(assessment.date).toLocaleDateString()})
                        </option>
                      ))}
                      {abetAssessments.length === 0 && (
                        <option value="">No assessments available</option>
                      )}
                    </select>
                  </div>

                  <div className="assessment-breakdown">
                    <p><strong>Assessment Breakdown:</strong></p>
                    <p>Continuous Improvement: {calculateComponentAverage('continuous-improvement')}%</p>
                    <p>Academic Performance: {calculateComponentAverage('academic-performance')}%</p>
                    <p>Learning Outcomes: {calculateComponentAverage('learning-outcome')}%</p>
                  </div>
                </div>
              </div>
              <div className="compliance-footer">
                <Link to="/assessments" className="btn primary">
                  <MdAssessment /> View All Assessments
                </Link>
                <Link to="/reports/new" className="btn secondary">
                  <MdOutlineReport /> Generate Report
                </Link>
              </div>
            </div>

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
                  { label: 'Create Assessment', link: '/assessments/new', icon: MdAssessment, color: '#f72585' },
                  { label: 'View Reports', link: '/reports', icon: MdOutlineReport, color: '#4CAF50' },
                  { label: 'Generate Reports', link: '/reports/new', icon: MdOutlineReport, color: '#2196F3' },
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
    </div>
  );
};


Dashboard.refreshDashboard = () => Dashboard().refreshDashboard();
Dashboard.createAssessment = (data) => Dashboard().createAssessment(data);
Dashboard.updateAssessment = (id, data) => Dashboard().updateAssessment(id, data);
export default Dashboard;
