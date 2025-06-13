import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaChartLine,
  FaBookOpen,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import { MdAssessment } from "react-icons/md";
import "./AssessmentList.css";

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    averageScore: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAssessments();
  }, [assessments, searchTerm, filterCourse]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assessments and courses in parallel
      const [assessmentsResponse, coursesResponse] = await Promise.all([
        api.get("/assessments/"),
        api.get("/courses/"),
      ]);

      const assessmentData =
        assessmentsResponse.data.results || assessmentsResponse.data;
      const courseData = coursesResponse.data.results || coursesResponse.data;

      // Process assessments data
      const processedAssessments = await Promise.all(
        assessmentData.map(async (assessment) => {
          try {
            // Get course details
            const course =
              courseData.find((c) => c.id === assessment.course) ||
              (await fetchCourseDetails(assessment.course));

            // Calculate score using your backend endpoint
            let calculatedScore = null;
            try {
              const scoreResponse = await api.get(
                `/assessments/${assessment.id}/calculate-score/`
              );
              // The backend returns percentage values (0-100), not 4.0 scale
              calculatedScore = scoreResponse.data.total_score;
            } catch (scoreError) {
              console.warn(
                `Failed to calculate score for assessment ${assessment.id}:`,
                scoreError
              );
            }

            return {
              ...assessment,
              course: course,
              calculatedScore: calculatedScore, // This is already a percentage (0-100)
            };
          } catch (error) {
            console.error(
              `Error processing assessment ${assessment.id}:`,
              error
            );
            return {
              ...assessment,
              course: { name: "Unknown Course", instructor: "Unknown" },
              calculatedScore: null,
            };
          }
        })
      );

      setAssessments(processedAssessments);
      setCourses(courseData);
      calculateStats(processedAssessments);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load assessments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseDetails = async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}/`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch course ${courseId}:`, error);
      return { name: "Unknown Course", instructor: "Unknown" };
    }
  };

  const calculateStats = (assessmentData) => {
    const total = assessmentData.length;
    const completed = assessmentData.filter(
      (a) => a.calculatedScore !== null && a.calculatedScore > 0
    ).length;
    const pending = total - completed;

    const validScores = assessmentData.filter(
      (a) => a.calculatedScore !== null && a.calculatedScore > 0
    );
    const totalScore = validScores.reduce(
      (sum, a) => sum + a.calculatedScore,
      0
    );
    const averageScore =
      validScores.length > 0 ? totalScore / validScores.length : 0;

    setStats({
      total,
      completed,
      pending,
      averageScore: Math.round(averageScore * 10) / 10,
    });
  };

  const filterAssessments = () => {
    let filtered = assessments;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (assessment) =>
          assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          assessment.course?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (filterCourse !== "all") {
      filtered = filtered.filter(
        (assessment) => assessment.course?.id?.toString() === filterCourse
      );
    }

    setFilteredAssessments(filtered);
  };

  const getStatusInfo = (assessment) => {
    const hasScore =
      assessment.calculatedScore !== null && assessment.calculatedScore > 0;
    if (hasScore) {
      const score = assessment.calculatedScore; // This is already a percentage (0-100)
      if (score >= 90)
        return {
          status: "excellent",
          icon: <FaCheckCircle />,
          text: "Excellent",
          color: "#10b981",
        };
      if (score >= 80)
        return {
          status: "good",
          icon: <FaCheckCircle />,
          text: "Good",
          color: "#f59e0b",
        };
      if (score >= 70)
        return {
          status: "fair",
          icon: <FaExclamationTriangle />,
          text: "Fair",
          color: "#ef4444",
        };
      return {
        status: "poor",
        icon: <FaTimesCircle />,
        text: "Poor",
        color: "#dc2626",
      };
    }
    return {
      status: "pending",
      icon: <FaExclamationTriangle />,
      text: "Pending",
      color: "#6b7280",
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDelete = async (assessmentId, assessmentName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${assessmentName}"? This action cannot be undone.`
      )
    ) {
      try {
        await api.delete(`/assessments/${assessmentId}/`);
        fetchData(); // Refresh the list
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete assessment");
      }
    }
  };

  if (loading) {
    return (
      <div className="assessments-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Assessments</h3>
          <p>Please wait while we fetch the assessment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assessments-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Assessments</h3>
          <p>{error}</p>
          <button onClick={fetchData} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="assessments-container">
      {/* Header Section */}
      <div className="assessments-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title">
              <div className="title-icon">
                <MdAssessment />
              </div>
              <div className="title-content">
                <h1>Assessment Management</h1>
                <p>Monitor and manage all course assessments</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/assessments/new" className="btn-primary">
              <FaPlus />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon total">
            <MdAssessment />
          </div>
          <div className="stat-content">
            <h3>Total Assessments</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completed}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon average">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Average Score</h3>
            <p className="stat-number">{stats.averageScore}%</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filters-container">
          <div className="filter-group">
            <FaBookOpen className="filter-icon" />
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assessments Content */}
      <div className="assessments-content">
        {filteredAssessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Assessments Found</h3>
            <p>
              {assessments.length === 0
                ? "Start by creating your first assessment."
                : "Try adjusting your search or filter criteria."}
            </p>
            {assessments.length === 0 && (
              <Link to="/assessments/new" className="btn-create">
                Create Assessment
              </Link>
            )}
          </div>
        ) : (
          <div className="assessments-grid">
            {filteredAssessments.map((assessment) => {
              const statusInfo = getStatusInfo(assessment);
              return (
                <div key={assessment.id} className="assessment-card">
                  <div className="card-header">
                    <div className="assessment-title">
                      <h3>{assessment.name}</h3>
                      <div
                        className="status-badge"
                        style={{
                          backgroundColor: `${statusInfo.color}15`,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="assessment-details">
                      <div className="detail-item">
                        <FaBookOpen className="detail-icon" />
                        <span>
                          {assessment.course?.name || "No course assigned"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{formatDate(assessment.date)}</span>
                      </div>
                      {assessment.course?.instructor && (
                        <div className="detail-item">
                          <FaUser className="detail-icon" />
                          <span>{assessment.course.instructor}</span>
                        </div>
                      )}
                    </div>

                    {assessment.calculatedScore !== null &&
                      assessment.calculatedScore > 0 && (
                        <div className="score-display">
                          <div
                            className="score-circle"
                            style={{ borderColor: statusInfo.color }}
                          >
                            <span
                              className="score-value"
                              style={{ color: statusInfo.color }}
                            >
                              {Math.round(assessment.calculatedScore)}
                            </span>
                            <span className="score-max">%</span>
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="card-actions">
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="btn-action view"
                      title="View Details"
                    >
                      <FaEye />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() =>
                        handleDelete(assessment.id, assessment.name)
                      }
                      className="btn-action delete"
                      title="Delete Assessment"
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentList;
