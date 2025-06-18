import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaPlus,
  FaChartLine,
  FaCalendarAlt,
  FaUser,
  FaBookOpen,
  FaGraduationCap,
  FaTarget,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaStar,
  FaClock,
  FaDownload,
  FaShare,
  FaEye,
  FaCalculator,
  FaSync,
  FaInfoCircle,
  FaChartBar,
  FaClipboardList,
  FaBrain,
  FaArrowUp,
} from "react-icons/fa";
import { MdAssessment, MdOutlineScience } from "react-icons/md";
import "./AssessmentDetail.css";

const AssessmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [continuousImprovements, setContinuousImprovements] = useState([]);
  const [academicPerformances, setAcademicPerformances] = useState([]);
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  const [assessmentScore, setAssessmentScore] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [program, setProgram] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessmentRes, ciRes, apRes, loRes] = await Promise.all([
        api.get(`/assessments/${id}/`),
        api.get(`/continuous-improvements/?assessment_id=${id}`),
        api.get(`/academic-performances/?assessment_id=${id}`),
        api.get(`/learning-outcomes/?assessment_id=${id}`),
      ]);

      setAssessment(assessmentRes.data);
      setContinuousImprovements(ciRes.data);
      setAcademicPerformances(apRes.data);
      setLearningOutcomes(loRes.data);

      // Fetch course details
      if (assessmentRes.data.course) {
        try {
          const courseRes = await api.get(
            `/courses/${assessmentRes.data.course}/`
          );
          setCourse(courseRes.data);

          // Fetch program info
          if (courseRes.data.program) {
            const programRes = await api.get(
              `/programs/${courseRes.data.program}/`
            );
            setProgram(programRes.data);
          }
        } catch (courseErr) {
          console.warn("Could not fetch course/program details:", courseErr);
        }
      }

      // Calculate assessment score
      await calculateScore();
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch assessment data.");
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = async () => {
    try {
      setScoreLoading(true);
      const scoreRes = await api.get(`/assessments/${id}/calculate-score/`);
      setAssessmentScore(scoreRes.data);
    } catch (err) {
      console.warn("Could not calculate score:", err);
      setAssessmentScore(null);
    } finally {
      setScoreLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this assessment? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/assessments/${id}/`);
        navigate("/assessments");
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete assessment.");
      }
    }
  };

  const getScoreStatus = (score) => {
    if (!score || score === 0)
      return {
        status: "pending",
        color: "#6b7280",
        bgColor: "rgba(107, 114, 128, 0.1)",
        icon: <FaClock />,
        text: "Pending",
      };

    if (score >= 90)
      return {
        status: "excellent",
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        icon: <FaStar />,
        text: "Excellent",
      };
    if (score >= 80)
      return {
        status: "good",
        color: "#3b82f6",
        bgColor: "rgba(59, 130, 246, 0.1)",
        icon: <FaCheckCircle />,
        text: "Good",
      };
    if (score >= 70)
      return {
        status: "fair",
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        icon: <FaExclamationTriangle />,
        text: "Fair",
      };
    return {
      status: "poor",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.1)",
      icon: <FaTimesCircle />,
      text: "Poor",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="assessment-detail-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Assessment Details</h3>
          <p>Please wait while we fetch the assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessment-detail-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Assessment</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const scoreStatus = getScoreStatus(assessmentScore?.total_score);

  const getABETStatus = (score) => {
    if (score >= 4) return "exceeded";
    if (score >= 3) return "met";
    if (score >= 2) return "approaching";
    return "below";
  };

  const getABETStatusText = (score) => {
    if (score >= 4) return "Exceeded";
    if (score >= 3) return "Met";
    if (score >= 2) return "Approaching";
    return "Below";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "exceeded":
        return "#10b981";
      case "met":
        return "#3b82f6";
      case "approaching":
        return "#f59e0b";
      case "below":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };
  return (
    <div className="assessment-detail-container">
      {/* Enhanced Header */}
      <div className="assessment-header">
        <div className="header-navigation">
          <Link to="/assessments" className="back-button">
            <FaArrowLeft />
            <span>Back to Assessments</span>
          </Link>
        </div>

        <div className="header-content">
          <div className="header-left">
            <div className="assessment-icon">
              <MdAssessment />
            </div>
            <div className="header-info">
              <h1>{assessment.name}</h1>
              <div className="assessment-meta">
                <div className="meta-item">
                  <FaBookOpen />
                  <span>{course?.name}</span>
                </div>
                {program && (
                  <div className="meta-item">
                    <FaGraduationCap />
                    <span>{program.name}</span>
                  </div>
                )}
                <div className="meta-item">
                  <FaCalendarAlt />
                  <span>{formatDate(assessment.date)}</span>
                </div>
                {course && (
                  <>
                    {course.instructor && (
                      <div className="meta-item">
                        <FaUser />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="header-right">
            {assessmentScore && (
              <div className="score-display-header">
                <div
                  className="score-circle-large"
                  style={{ borderColor: scoreStatus.color }}
                >
                  <span
                    className="score-value"
                    style={{ color: scoreStatus.color }}
                  >
                    {Math.round(assessmentScore.total_score)}
                  </span>
                  <span className="score-unit">%</span>
                </div>
                <div
                  className="score-status"
                  style={{
                    backgroundColor: scoreStatus.bgColor,
                    color: scoreStatus.color,
                  }}
                >
                  {scoreStatus.icon}
                  <span>{scoreStatus.text}</span>
                </div>
              </div>
            )}

            <div className="header-actions">
              <Link to={`/assessments/${id}/edit`} className="btn-primary">
                <FaEdit />
                <span>Edit</span>
              </Link>
              <button onClick={handleDelete} className="btn-danger">
                <FaTrash />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown Section */}
      {assessmentScore && (
        <div className="score-breakdown-section">
          <h2>Assessment Score Breakdown</h2>
          <div className="score-components">
            <div className="component-card">
              <div className="component-header">
                <FaArrowUp className="component-icon" />
                <h3>Continuous Improvement</h3>
              </div>
              <div className="component-score">
                <span className="score-large">
                  {Math.round(
                    assessmentScore.continuous_improvement_score || 0
                  )}
                  %
                </span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${
                        assessmentScore.continuous_improvement_score || 0
                      }%`,
                      backgroundColor: "#10b981",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="component-card">
              <div className="component-header">
                <FaChartBar className="component-icon" />
                <h3>Academic Performance</h3>
              </div>
              <div className="component-score">
                <span className="score-large">
                  {Math.round(assessmentScore.academic_performance_score || 0)}%
                </span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${
                        assessmentScore.academic_performance_score || 0
                      }%`,
                      backgroundColor: "#3b82f6",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="component-card">
              <div className="component-header">
                <FaBrain className="component-icon" />
                <h3>Learning Outcomes</h3>
              </div>
              <div className="component-score">
                <span className="score-large">
                  {Math.round(assessmentScore.learning_outcome_score || 0)}%
                </span>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${assessmentScore.learning_outcome_score || 0}%`,
                      backgroundColor: "#8b5cf6",
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="component-card abet-status">
              <div className="component-header">
                <FaGraduationCap className="component-icon" />
                <h3>ABET Status</h3>
              </div>
              <div className="abet-indicator">
                {assessmentScore.is_abet_accredited ? (
                  <div className="abet-compliant">
                    <FaCheckCircle />
                    <span>ABET Compliant</span>
                  </div>
                ) : (
                  <div className="abet-non-compliant">
                    <FaExclamationTriangle />
                    <span>Needs Review</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          <FaInfoCircle />
          <span>Overview</span>
        </button>
        <button
          className={`tab-button ${activeTab === "continuous" ? "active" : ""}`}
          onClick={() => setActiveTab("continuous")}
        >
          <FaArrowUp />
          <span>Continuous Improvement</span>
          <span className="tab-count">{continuousImprovements.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === "academic" ? "active" : ""}`}
          onClick={() => setActiveTab("academic")}
        >
          <FaChartBar />
          <span>Academic Performance</span>
          <span className="tab-count">{academicPerformances.length}</span>
        </button>
        <button
          className={`tab-button ${activeTab === "learning" ? "active" : ""}`}
          onClick={() => setActiveTab("learning")}
        >
          <FaBrain />
          <span>Learning Outcomes</span>
          <span className="tab-count">{learningOutcomes.length}</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Assessment Summary</h3>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Components</span>
                    <span className="stat-value">
                      {continuousImprovements.length +
                        academicPerformances.length +
                        learningOutcomes.length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Created</span>
                    <span className="stat-value">
                      {formatDate(assessment.created_at)}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Last Updated</span>
                    <span className="stat-value">
                      {formatDate(assessment.updated_at)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <Link
                    to={`/continuous-improvements/new?assessment_id=${id}`}
                    className="quick-action-btn"
                  >
                    <FaPlus />
                    <span>Add Continuous Improvement</span>
                  </Link>
                  <Link
                    to={`/assessments/${id}/academic-performance/new`}
                    className="quick-action-btn"
                  >
                    <FaPlus />
                    <span>Add Academic Performance</span>
                  </Link>
                  <Link
                    to={`/learning-outcomes/new?assessment_id=${id}`}
                    className="quick-action-btn"
                  >
                    <FaPlus />
                    <span>Add Learning Outcome</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "continuous" && (
          <div className="component-section">
            <div className="section-header">
              <h2>Continuous Improvements</h2>
              <Link
                to={`/continuous-improvements/new?assessment_id=${id}`}
                className="btn-primary"
              >
                <FaPlus />
                <span>Add New</span>
              </Link>
            </div>

            {continuousImprovements.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaArrowUp />
                </div>
                <h3>No Continuous Improvements</h3>
                <p>
                  Start tracking improvement actions and their effectiveness.
                </p>
                <Link
                  to={`/continuous-improvements/new?assessment_id=${id}`}
                  className="btn-create"
                >
                  <FaPlus />
                  Add First Improvement
                </Link>
              </div>
            ) : (
              <div className="items-grid">
                {continuousImprovements.map((ci) => (
                  <div
                    key={ci.id}
                    className="item-card clickable"
                    onClick={() =>
                      navigate(`/continuous-improvements/${ci.id}`)
                    }
                  >
                    <div className="item-header">
                      <div className="item-icon">
                        <FaArrowUp />
                      </div>
                      <div className="item-scores">
                        <span className="score-badge">Score: {ci.score}</span>
                        <span className="weight-badge">
                          Weight: {ci.weight}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      <h4>Action Taken</h4>
                      <p>{ci.action_taken}</p>
                      <h4>Effectiveness</h4>
                      <p>{ci.effectiveness_measure}</p>
                      {ci.implementation_date && (
                        <div className="item-meta">
                          <FaCalendarAlt />
                          <span>
                            Implemented: {formatDate(ci.implementation_date)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "academic" && (
          <div className="component-section">
            <div className="section-header">
              <h2>Academic Performance</h2>
              <Link
                to={`/assessments/${id}/academic-performance/new`}
                className="btn-primary"
              >
                <FaPlus />
                <span>Add New</span>
              </Link>
            </div>

            {academicPerformances.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaChartBar />
                </div>
                <h3>No Academic Performance Data</h3>
                <p>Add grades, exam scores, and performance metrics.</p>
                <Link
                  to={`/assessments/${id}/academic-performance/new`}
                  className="btn-create"
                >
                  <FaPlus />
                  Add First Performance
                </Link>
              </div>
            ) : (
              <div className="items-grid">
                {academicPerformances.map((ap) => (
                  <div
                    key={ap.id}
                    className="item-card clickable"
                    onClick={() => navigate(`/academic-performances/${ap.id}`)}
                  >
                    <div className="item-header">
                      <div className="item-icon">
                        <FaChartBar />
                      </div>
                      <div className="item-scores">
                        <span className="score-badge">Grade: {ap.grade}</span>
                        <span className="weight-badge">
                          Weight: {ap.weight}
                        </span>
                      </div>
                    </div>
                    <div className="item-content">
                      <h4>{ap.assessmentType}</h4>
                      <div className="performance-stats">
                        <div className="stat-row">
                          <span className="stat-label">Mean:</span>
                          <span className="stat-value">{ap.mean}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">High:</span>
                          <span className="stat-value">{ap.high}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">Low:</span>
                          <span className="stat-value">{ap.low}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "learning" && (
          <div className="component-section">
            <div className="section-header">
              <h2>Learning Outcomes</h2>
              <Link
                to={`/learning-outcomes/new?assessment_id=${id}`}
                className="btn-primary"
              >
                <FaPlus />
                <span>Add New</span>
              </Link>
            </div>

            {learningOutcomes.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaBrain />
                </div>
                <h3>No Learning Outcomes</h3>
                <p>
                  Define learning outcomes and ABET mappings for this
                  assessment.
                </p>
                <Link
                  to={`/learning-outcomes/new?assessment_id=${id}`}
                  className="btn-create"
                >
                  <FaPlus />
                  Add First Outcome
                </Link>
              </div>
            ) : (
              <div className="learning-outcomes-detailed">
                {learningOutcomes.map((lo) => (
                  <div
                    key={lo.AssesssmentLearningOutcome_id}
                    className="learning-outcome-card-detailed"
                    onClick={() =>
                      navigate(
                        `/learning-outcomes/${lo.AssesssmentLearningOutcome_id}`
                      )
                    }
                  >
                    <div className="outcome-header">
                      <div className="outcome-title">
                        <div className="outcome-icon">
                          <FaBrain />
                        </div>
                        <div className="outcome-info">
                          <h3>Learning Outcome</h3>
                          <p className="outcome-description">
                            {lo.description}
                          </p>
                        </div>
                      </div>

                      {/* Display mapped Student Outcomes */}
                      <div className="mapped-student-outcomes">
                        {/* In your Learning Outcomes mapping - Add safety checks */}
                        {Array.isArray(lo.abetoutcomesscores) &&
                        lo.abetoutcomesscores.length > 0 ? (
                          lo.abetoutcomesscores
                            .map((aos, idx) => {
                              // ✅ Add null safety check for abetoutcome
                              if (!aos || !aos.abetoutcome) {
                                console.warn(
                                  `ABET outcome missing for score ${idx}:`,
                                  aos
                                );
                                return null; // Skip this item
                              }

                              return (
                                <div
                                  key={idx}
                                  className="student-outcome-badge"
                                >
                                  <span className="so-label">
                                    {aos.abetoutcome.label}
                                  </span>
                                  <span className="so-score">
                                    {aos.score}/4
                                  </span>
                                  <span
                                    className="so-status"
                                    style={{
                                      color: getStatusColor(
                                        getABETStatus(aos.score)
                                      ),
                                    }}
                                  >
                                    {getABETStatusText(aos.score)}
                                  </span>
                                </div>
                              );
                            })
                            .filter(Boolean) // Remove null items
                        ) : (
                          <span className="no-mapping">
                            No ABET outcomes mapped
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ABET Outcomes Details */}
                    {Array.isArray(lo.abetoutcomesscores) &&
                      lo.abetoutcomesscores.length > 0 && (
                        <div className="abet-outcomes-section">
                          <h4>ABET Student Outcome Mappings</h4>
                          <div className="abet-outcomes-grid">
                            {lo.abetoutcomesscores.map((aos, idx) => {
                              if (!aos || !aos.abetoutcome) {
                                return null;
                              }

                              const abetOutcome = aos.abetoutcome;
                              const status = getABETStatus(aos.score);
                              const statusColor = getStatusColor(status);

                              return (
                                <div key={idx} className="abet-outcome-item">
                                  <div className="abet-outcome-header">
                                    <span className="abet-label">
                                      {aos.abetoutcome.label}
                                    </span>
                                    <span
                                      className={`abet-status ${status}`}
                                      style={{
                                        backgroundColor: `${statusColor}20`,
                                        color: statusColor,
                                      }}
                                    >
                                      {getABETStatusText(aos.score)}
                                    </span>
                                  </div>
                                  <div className="abet-outcome-details">
                                    <p className="abet-description">
                                      {aos.abetoutcome.description}
                                    </p>
                                    <div className="abet-metrics">
                                      <div className="metric">
                                        <span className="metric-label">
                                          Score:
                                        </span>
                                        <span className="metric-value">
                                          {aos.score}/4
                                        </span>
                                      </div>
                                      <div className="metric">
                                        <span className="metric-label">
                                          Evidence:
                                        </span>
                                        <span className="metric-value">
                                          {aos.evidence_type}
                                        </span>
                                      </div>
                                      {aos.level_description && (
                                        <div className="metric">
                                          <span className="metric-label">
                                            Level:
                                          </span>
                                          <span className="metric-value">
                                            {aos.level_description}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    <div className="score-progress">
                                      <div
                                        className="score-bar"
                                        style={{
                                          width: `${(aos.score / 4) * 100}%`,
                                          backgroundColor: statusColor,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDetail;
