import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaUniversity,
  FaClipboardList,
  FaBookOpen,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaChartLine,
} from "react-icons/fa";
import { MdAssessment, MdTrendingUp, MdSchool } from "react-icons/md";
import "./ProgramDetail.css";

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [averageData, setAverageData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programRes, avgRes, assessmentsRes] = await Promise.all([
          api.get(`/programs/${id}/`),
          api.get(`/assessments/program/${id}/average/`),
          api.get(`/assessments/?program_id=${id}`),
        ]);
        setProgram(programRes.data);
        setAverageData(avgRes.data);
        setAssessments(assessmentsRes.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch program details");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this program? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/programs/${id}/`);
        navigate("/programs");
      } catch (err) {
        setError("Failed to delete program");
        console.error(err);
      }
    }
  };

  const getComplianceColor = (score) => {
    if (score >= 90) return "#10b981";
    if (score >= 80) return "#f59e0b";
    if (score >= 70) return "#ef4444";
    return "#dc2626";
  };

  const getComplianceStatus = (score) => {
    if (score >= 90) return "ABET Accredited";
    if (score >= 80) return "Near Accreditation";
    if (score >= 70) return "Needs Improvement";
    return "At Risk";
  };

  const getComplianceIcon = (score) => {
    if (score >= 90) return <MdTrendingUp />;
    if (score >= 80) return <MdSchool />;
    return <FaChartLine />;
  };

  if (loading) {
    return (
      <div className="program-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Program Details</h3>
          <p>Please wait while we fetch the program information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="program-detail-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Program</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-retry"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="program-detail-container">
      {/* Header Section */}
      <div className="program-header">
        <div className="header-content">
          <div className="header-left">
            <Link to="/programs" className="back-button">
              <FaArrowLeft />
              <span>Back to Programs</span>
            </Link>
            <div className="program-title">
              <div className="program-icon">
                <FaUniversity />
              </div>
              <div className="title-content">
                <h1>{program.name}</h1>
                <div className="program-meta">
                  <span className="department-badge">{program.department}</span>
                  <span className="level-badge">
                    {program.level === "B"
                      ? "Baccalaureate"
                      : program.level === "M"
                      ? "Masters"
                      : "Integrated"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to={`/programs/${id}/edit`} className="btn-action edit">
              <FaEdit />
              <span>Edit Program</span>
            </Link>
            <button onClick={handleDelete} className="btn-action delete">
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="program-content">
        {/* Left Panel - Overview */}
        <div className="content-left">
          <div className="overview-card">
            <div className="card-header">
              <h3>Program Overview</h3>
              <div
                className="compliance-badge"
                style={{
                  backgroundColor: `${getComplianceColor(
                    averageData?.average_score
                  )}15`,
                }}
              >
                {getComplianceIcon(averageData?.average_score)}
                <span
                  style={{
                    color: getComplianceColor(averageData?.average_score),
                  }}
                >
                  {getComplianceStatus(averageData?.average_score)}
                </span>
              </div>
            </div>

            <div className="program-description">
              <p>
                {program.description ||
                  "No description available for this program."}
              </p>
            </div>

            <div className="score-section">
              <div className="score-chart">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {averageData && (
                    <path
                      className="circle"
                      strokeDasharray={`${averageData.average_score},100`}
                      style={{
                        stroke: getComplianceColor(averageData.average_score),
                      }}
                      d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  )}
                  <text x="18" y="18" className="percentage">
                    {averageData
                      ? `${Math.round(averageData.average_score)}%`
                      : "N/A"}
                  </text>
                </svg>
              </div>
              <div className="score-details">
                <h4>Assessment Score</h4>
                <p className="score-description">
                  Overall program performance based on assessment outcomes
                </p>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon courses">
                <FaBookOpen />
              </div>
              <div className="stat-content">
                <h4>Courses</h4>
                <p className="stat-number">{program.courses?.length || 0}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon assessments">
                <MdAssessment />
              </div>
              <div className="stat-content">
                <h4>Assessments</h4>
                <p className="stat-number">{assessments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Navigation & History */}
        <div className="content-right">
          <div className="navigation-card">
            <div className="card-header">
              <h3>Program Sections</h3>
              <p>Explore different aspects of this program</p>
            </div>
            <div className="navigation-grid">
              {[
                {
                  title: "Courses",
                  icon: <FaBookOpen />,
                  link: `/programs/${id}/courses`,
                  description: "View and manage program courses",
                  color: "#3b82f6",
                },
                {
                  title: "Objectives",
                  icon: <FaClipboardList />,
                  link: `/programs/${id}/objectives`,
                  description: "Program educational objectives",
                  color: "#10b981",
                },
                {
                  title: "Learning Outcomes",
                  icon: <MdAssessment />,
                  link: `/programs/${id}/outcomes`,
                  description: "Student learning outcomes",
                  color: "#f59e0b",
                },
                {
                  title: "Assessments",
                  icon: <MdAssessment />,
                  link: `/programs/${id}/assessments`,
                  description: "Assessment data and analytics",
                  color: "#ef4444",
                },
              ].map(({ title, icon, link, description, color }) => (
                <Link to={link} key={title} className="nav-tile">
                  <div
                    className="nav-icon"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    {icon}
                  </div>
                  <div className="nav-content">
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                  <div className="nav-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="history-card">
            <div className="card-header">
              <h3>Recent Assessment Activity</h3>
              <Link
                to={`/programs/${id}/assessments`}
                className="view-all-link"
              >
                View All →
              </Link>
            </div>
            <div className="history-content">
              {assessments.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h4>No Assessments Yet</h4>
                  <p>
                    Start by creating your first assessment for this program.
                  </p>
                  <Link
                    to={`/programs/${id}/assessments/new`}
                    className="btn-create"
                  >
                    Create Assessment
                  </Link>
                </div>
              ) : (
                <div className="history-list">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="history-item">
                      <div className="history-icon">
                        <MdAssessment />
                      </div>
                      <div className="history-details">
                        <h5>{assessment.name}</h5>
                        <p className="history-date">
                          {new Date(assessment.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="history-score">
                        {assessment.score && (
                          <span className="score-badge">
                            {Math.round(assessment.score)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
