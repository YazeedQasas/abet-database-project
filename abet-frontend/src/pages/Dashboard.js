import React, { useState, useEffect, useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import { dashboardAPI } from "../services/dashboardAPI";
import axios from "axios";

const Dashboard = () => {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2024");
  const [activeTab, setActiveTab] = useState("overview");

  // New state for backend data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressMetrics, setProgressMetrics] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    abetOutcomes: [],
    coursesData: [],
    assessmentData: [],
    complianceMetrics: [],
    recentActivities: [],
    facultyTrainings: [],
  });

  const [basicStats, setBasicStats] = useState({
    programs: 0,
    courses: 0,
    assessments: 0,
    departments: 0,
    average_score: 0,
  });
  // Auth context for user permissions
  const { currentUser, hasPermission } = useContext(AuthContext);

  // Add this after your state and context declarations
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (currentUser) {
      fetchAllDashboardData();
    }
  }, [currentUser, selectedSemester]); // Re-fetch when user or semester changes

  const getFacultyTrainingStats = () => {
    // This should match the same calculation logic as FacultyTraining.js
    if (
      dashboardData.facultyTrainings &&
      dashboardData.facultyTrainings.length > 0
    ) {
      const total = dashboardData.facultyTrainings.length;
      const completed = dashboardData.facultyTrainings.filter(
        (t) => t.is_completed === true
      ).length;
      const completionRate =
        total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        pending: total - completed,
        completionRate,
      };
    }
    return null;
  };

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create array of API calls based on user permissions
      const apiCalls = [];

      // Basic data that all authenticated users can see
      apiCalls.push(
        { name: "stats", call: dashboardAPI.getDashboardStats() },
        { name: "abetOutcomes", call: dashboardAPI.getABETOutcomes() },
        {
          name: "facultyTraining",
          call: axios.get("http://localhost:8000/api/faculty-training/", {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }),
        }
      );

      // Rest of your existing apiCalls logic...
      if (hasPermission("faculty") || hasPermission("admin")) {
        apiCalls.push(
          {
            name: "courseAssessments",
            call: dashboardAPI.getCourseAssessments(selectedSemester),
          },
          { name: "programAverages", call: dashboardAPI.getProgramAverages() }
        );
      }

      if (hasPermission("admin")) {
        apiCalls.push({
          name: "auditLogs",
          call: dashboardAPI.getRecentActivities(),
        });
      }

      // Execute all API calls and handle individual failures
      const responses = await Promise.allSettled(
        apiCalls.map((api) => api.call)
      );

      responses.forEach((response, index) => {
        const apiName = apiCalls[index].name;
        if (response.status === "fulfilled" && apiName === "stats") {
          console.log("🔍 Stats API Response Structure:", {
            hasAbetOutcomes: !!response.value.data.abet_outcomes,
            abetOutcomesLength: response.value.data.abet_outcomes?.length || 0,
            firstOutcome: response.value.data.abet_outcomes?.[0] || "none",
            allKeys: Object.keys(response.value.data),
          });
        }
      });

      // Process responses safely
      const newDashboardData = { ...dashboardData };

      responses.forEach((response, index) => {
        const apiName = apiCalls[index].name;

        if (response.status === "fulfilled") {
          console.log(
            `✅ ${apiName} loaded successfully:`,
            response.value.data
          );

          // Map API responses to dashboard data
          // In your responses.forEach loop, add this case to your switch statement:
          switch (apiName) {
            case "stats":
              const statsData = response.value.data;
              console.log("📊 Full stats data received:", statsData);

              // Your existing stats handling code...
              if (
                statsData.abet_outcomes &&
                statsData.abet_outcomes.length > 0
              ) {
                newDashboardData.abetOutcomes = statsData.abet_outcomes;
                console.log(
                  "✅ ABET outcomes assigned from stats:",
                  statsData.abet_outcomes.length
                );
              }

              if (statsData.courses_data && statsData.courses_data.length > 0) {
                newDashboardData.coursesData = statsData.courses_data;
                console.log(
                  "✅ Courses data assigned from stats:",
                  statsData.courses_data.length
                );
              }

              if (statsData.progress_metrics) {
                setProgressMetrics(statsData.progress_metrics);
              }

              if (statsData.compliance_metrics) {
                newDashboardData.complianceMetrics =
                  statsData.compliance_metrics;
              }
              break;

            // ADD THIS NEW CASE:
            case "facultyTraining":
              newDashboardData.facultyTrainings = response.value.data;
              console.log(
                "✅ Faculty training data assigned:",
                response.value.data.length
              );
              break;

            case "courseAssessments":
              // Your existing courseAssessments handling...
              if (
                !newDashboardData.coursesData ||
                newDashboardData.coursesData.length === 0
              ) {
                newDashboardData.coursesData = response.value.data;
                console.log("✅ Courses data assigned from fallback endpoint");
              }
              break;

            case "auditLogs":
              newDashboardData.recentActivities = response.value.data;
              break;

            default:
              console.log(`Data for ${apiName}:`, response.value.data);
          }
        } else {
          console.warn(`⚠️ ${apiName} failed:`, response.reason.message);
          // Don't set error state for individual API failures
          // The dashboard will use fallback static data
        }
      });

      setDashboardData(newDashboardData);
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add refresh function for your existing refresh button
  const handleRefresh = () => {
    fetchAllDashboardData();
  };

  // ABET Student Outcomes (2019-2020 Criteria)
  const abetOutcomes = [
    {
      id: "SO1",
      label: "Engineering Knowledge",
      score: 3.2,
      target: 3.0,
      status: "met",
    },
    {
      id: "SO2",
      label: "Problem Analysis",
      score: 2.8,
      target: 3.0,
      status: "below",
    },
    {
      id: "SO3",
      label: "Design/Development",
      score: 3.4,
      target: 3.0,
      status: "met",
    },
    {
      id: "SO4",
      label: "Investigation",
      score: 3.1,
      target: 3.0,
      status: "met",
    },
    {
      id: "SO5",
      label: "Modern Tool Usage",
      score: 3.6,
      target: 3.0,
      status: "exceeded",
    },
    {
      id: "SO6",
      label: "Professional Responsibility",
      score: 2.9,
      target: 3.0,
      status: "below",
    },
    {
      id: "SO7",
      label: "Communication",
      score: 3.3,
      target: 3.0,
      status: "met",
    },
  ];

  const coursesData = [
    {
      code: "CS 101",
      name: "Introduction to Programming",
      instructor: "Dr. Smith",
      enrollment: 45,
      outcomes: ["SO1", "SO5"],
      assessmentScore: 3.2,
      status: "compliant",
    },
    {
      code: "CS 201",
      name: "Data Structures",
      instructor: "Dr. Johnson",
      enrollment: 38,
      outcomes: ["SO1", "SO2", "SO5"],
      assessmentScore: 2.8,
      status: "needs-review",
    },
    {
      code: "CS 301",
      name: "Software Engineering",
      instructor: "Dr. Wilson",
      enrollment: 32,
      outcomes: ["SO3", "SO6", "SO7"],
      assessmentScore: 3.4,
      status: "compliant",
    },
    {
      code: "CS 401",
      name: "Senior Capstone",
      instructor: "Dr. Brown",
      enrollment: 28,
      outcomes: ["SO2", "SO3", "SO4", "SO7"],
      assessmentScore: 3.1,
      status: "compliant",
    },
  ];

  const assessmentData = [
    {
      type: "Direct Assessment",
      method: "Exam Questions",
      courses: 12,
      completion: 85,
      avgScore: 3.2,
    },
    {
      type: "Direct Assessment",
      method: "Project Rubrics",
      courses: 8,
      completion: 92,
      avgScore: 3.4,
    },
    {
      type: "Indirect Assessment",
      method: "Student Surveys",
      courses: 15,
      completion: 78,
      avgScore: 3.1,
    },
    {
      type: "Indirect Assessment",
      method: "Alumni Feedback",
      courses: 5,
      completion: 65,
      avgScore: 3.3,
    },
  ];

  const complianceMetrics = [
    {
      metric: "Course Syllabi Updated",
      value: "94%",
      target: "100%",
      status: "warning",
    },
    {
      metric: "Assessment Data Collected",
      value: "87%",
      target: "90%",
      status: "warning",
    },
    {
      metric: "Student Outcomes Met",
      value: "71%",
      target: "80%",
      status: "critical",
    },
    {
      metric: "Faculty Training Complete",
      value: "96%",
      target: "95%",
      status: "good",
    },
  ];

  // In your SimpleProgressChart component, add safety checks
  const SimpleProgressChart = ({ data, title }) => {
    // Add safety check for data
    if (!data || !Array.isArray(data)) {
      return (
        <div className="chart-container">
          <h3>{title}</h3>
          <p>No data available</p>
        </div>
      );
    }

    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="progress-chart">
          {data.map((item, index) => {
            // Add safety checks for each property
            const score = typeof item.score === "number" ? item.score : 0;
            const target = typeof item.target === "number" ? item.target : 3.0;
            const percentage = target > 0 ? (score / target) * 100 : 0;

            return (
              <div key={index} className="progress-item">
                <div className="progress-label">
                  <span>{item.id || item.label || `Item ${index + 1}`}</span>
                  <span className="progress-value">
                    {score.toFixed(1)} / {target.toFixed(1)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${item.status || "unknown"}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>ABET Assessment Dashboard</h1>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const prepareChartData = (data) => {
    if (!data || !Array.isArray(data)) {
      console.log("⚠️ prepareChartData received invalid data:", data);
      return [];
    }

    return data.map((item, index) => {
      const prepared = {
        id: item.id || item.code || item.label || `outcome-${index}`,
        label: item.label || item.description || `Outcome ${index + 1}`,
        score:
          typeof item.score === "number"
            ? item.score
            : typeof item.current_score === "number"
            ? item.current_score / 25
            : 0, // Convert percentage back to 4-point scale
        target: item.target || item.target_score || 3.0,
        status: item.status || "unknown",
      };

      console.log(`📊 Prepared chart data for ${prepared.id}:`, prepared);
      return prepared;
    });
  };

  // Show error state if data fetch failed
  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>ABET Assessment Dashboard</h1>
        </div>
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ {error}</h3>
            <button onClick={handleRefresh} className="refresh-btn">
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="abet-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>ABET Accreditation Assessment Dashboard</h1>
            <p>Assessment Cycle 2024-2025</p>
          </div>
          <div className="header-controls">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="semester-select"
            >
              <option value="Fall 2024">Fall 2024</option>
              <option value="Spring 2024">Spring 2024</option>
              <option value="Summer 2024">Summer 2024</option>
            </select>
            <button className="export-btn">
              <i className="fas fa-download"></i>
              Export Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="tab-navigation">
          <button
            className={`tab ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab ${activeTab === "outcomes" ? "active" : ""}`}
            onClick={() => setActiveTab("outcomes")}
          >
            Student Outcomes
          </button>
          <button
            className={`tab ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            Course Assessment
          </button>
          <button
            className={`tab ${activeTab === "compliance" ? "active" : ""}`}
            onClick={() => setActiveTab("compliance")}
          >
            Compliance
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {activeTab === "overview" && (
          <div className="overview-content">
            {/* Key Metrics */}
            <div className="metrics-grid">
              {(progressMetrics.length > 0
                ? progressMetrics
                : complianceMetrics
              ).map((metric, index) => {
                // Get real-time faculty training stats
                const realTimeStats = getFacultyTrainingStats();

                // Determine display values
                let displayValue = metric.percentage || parseInt(metric.value);
                let displayTarget = metric.target; // SIMPLIFIED: Just use the target as-is
                let displayStatus = metric.status;
                let displayDetails = null;
                let isStudentOutcomes = false;

                // Special handling for Student Outcomes
                if (
                  metric.title === "Student Outcomes Met" ||
                  metric.name === "Student Outcomes Met"
                ) {
                  isStudentOutcomes = true;
                  displayValue = metric.percentage; // This will be "7/10"
                  displayTarget = `Target: ${metric.target}`; // This will be "Target: 8/10"
                  displayDetails = `${metric.current} of ${metric.total} outcomes meeting threshold`;
                }
                // Override for Faculty Training metrics
                else if (
                  metric.title === "Faculty Training Complete" ||
                  metric.name === "Faculty Training Complete"
                ) {
                  if (realTimeStats) {
                    displayValue = realTimeStats.completionRate;
                    displayStatus =
                      realTimeStats.completionRate >= 95
                        ? "good"
                        : realTimeStats.completionRate >= 80
                        ? "warning"
                        : "critical";
                    displayDetails = `${realTimeStats.completed} of ${realTimeStats.total} completed`;
                  }
                  displayTarget = `Target: ${metric.target}%`;
                }
                // For all other metrics, just add "Target: " and "%"
                else {
                  displayTarget = `Target: ${metric.target}%`;
                }

                return (
                  <div key={index} className="metric-card">
                    <div className="metric-header">
                      <h3>{metric.title || metric.name}</h3>
                      <span
                        className={`status-indicator ${displayStatus}`}
                      ></span>
                    </div>
                    <div className="metric-value">
                      <span className="percentage">
                        {isStudentOutcomes ? displayValue : `${displayValue}%`}
                      </span>
                      <span className="target">{displayTarget}</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${displayStatus}`}
                        style={{
                          width: `${
                            isStudentOutcomes
                              ? metric.current && metric.total
                                ? (metric.current / metric.total) * 100
                                : 0
                              : displayValue
                          }%`,
                        }}
                      ></div>
                    </div>
                    {displayDetails && (
                      <div className="metric-details">{displayDetails}</div>
                    )}
                    {!displayDetails &&
                      metric.current !== undefined &&
                      !isStudentOutcomes && (
                        <div className="metric-details">
                          {metric.current} of {metric.total} completed
                        </div>
                      )}
                  </div>
                );
              })}
            </div>

            {/* Assessment Overview */}
            <div className="assessment-overview">
              <div className="chart-container">
                <SimpleProgressChart
                  data={prepareChartData(
                    dashboardData.abetOutcomes.length > 0
                      ? dashboardData.abetOutcomes
                      : abetOutcomes
                  ).slice(0, 4)}
                  title="Student Outcomes Performance (SO1-SO4)"
                />
              </div>
              <div className="chart-container">
                <SimpleProgressChart
                  data={prepareChartData(
                    dashboardData.abetOutcomes.length > 0
                      ? dashboardData.abetOutcomes
                      : abetOutcomes
                  ).slice(4)}
                  title="Student Outcomes Performance (SO5-SO7)"
                />
              </div>
            </div>
            {/* Recent Assessment Activities */}
            <div className="recent-activities">
              <h3>Recent Assessment Activities</h3>
              <div className="activity-timeline">
                <div className="activity-item">
                  <div className="activity-marker completed"></div>
                  <div className="activity-content">
                    <h4>CS 301 Project Rubrics Submitted</h4>
                    <p>
                      Dr. Wilson completed assessment for Software Engineering
                      capstone projects
                    </p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-marker pending"></div>
                  <div className="activity-content">
                    <h4>Student Survey Responses Due</h4>
                    <p>
                      End-of-semester surveys for outcome assessment pending
                    </p>
                    <span className="activity-time">Due in 3 days</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-marker completed"></div>
                  <div className="activity-content">
                    <h4>Faculty Training Session Completed</h4>
                    <p>
                      Assessment methodology workshop for new faculty members
                    </p>
                    <span className="activity-time">1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "outcomes" && (
          <div className="outcomes-content">
            <div className="outcomes-grid">
              {(dashboardData.abetOutcomes.length > 0
                ? dashboardData.abetOutcomes
                : abetOutcomes
              ).map((outcome, index) => {
                // Calculate score and percentage correctly
                let score, percentage;

                if (outcome.score !== undefined && outcome.score > 0) {
                  score = outcome.score;
                  percentage = (score / 4.0) * 100;
                } else if (
                  outcome.current_score !== undefined &&
                  outcome.current_score > 0
                ) {
                  percentage = outcome.current_score;
                  score = (percentage / 100) * 4.0;
                } else {
                  score = 0;
                  percentage = 0;
                }

                const target = outcome.target || outcome.target_score || 3.0;
                const targetPercentage = (target / 4.0) * 100;

                return (
                  <div key={index} className="outcome-card">
                    <div className="outcome-header">
                      <h3>
                        {outcome.id || outcome.label || `Outcome ${index + 1}`}
                      </h3>
                      <span
                        className={`outcome-status ${
                          outcome.status || "unknown"
                        }`}
                      >
                        {outcome.status === "met"
                          ? "Target Met"
                          : outcome.status === "exceeded"
                          ? "Exceeded"
                          : "Below Target"}
                      </span>
                    </div>
                    <h4>
                      {outcome.label || outcome.description || "No description"}
                    </h4>
                    <div className="outcome-score">
                      <span className="score">
                        {(typeof score === "number" ? score : 0).toFixed(1)}
                      </span>
                      <span className="target">
                        /{" "}
                        {(typeof target === "number" ? target : 3.0).toFixed(1)}
                      </span>
                    </div>
                    {/* FIXED: Change from outcome-progress to progress-bar */}
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${
                          outcome.status || "unknown"
                        }`}
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    {/* Optional: Add percentage display */}
                    <div className="outcome-percentage">
                      {percentage.toFixed(1)}% of target
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="courses-content">
            <div className="courses-table-container">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Instructor</th>
                    <th>Enrollment</th>
                    <th>Mapped Outcomes</th>
                    <th>Assessment Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(dashboardData.coursesData.length > 0
                    ? dashboardData.coursesData
                    : coursesData
                  ).map((course, index) => (
                    <tr key={index}>
                      <td className="course-code">
                        {course.code || course.name}
                      </td>
                      <td>{course.name || course.course_name}</td>
                      <td>
                        {course.instructor || course.instructor_name || "TBD"}
                      </td>
                      <td>{course.enrollment || 0}</td>
                      <td className="mapped-outcomes">
                        {course.mapped_outcomes &&
                        Array.isArray(course.mapped_outcomes) &&
                        course.mapped_outcomes.length > 0 ? (
                          <div className="outcomes-container">
                            {course.mapped_outcomes.map((outcome, idx) => (
                              <span
                                key={idx}
                                className={`outcome-badge ${
                                  typeof outcome === "object"
                                    ? outcome.status
                                    : "met"
                                }`}
                                title={
                                  typeof outcome === "object"
                                    ? `Score: ${outcome.score}/4 (${outcome.evidence_type})`
                                    : `Outcome: ${outcome}`
                                }
                              >
                                {typeof outcome === "object"
                                  ? outcome.label
                                  : outcome}
                              </span>
                            ))}
                            {course.outcome_coverage && (
                              <div className="outcome-coverage">
                                Coverage: {course.outcome_coverage}%
                              </div>
                            )}
                          </div>
                        ) : // Fallback for simple array format
                        course.outcomes && course.outcomes.length > 0 ? (
                          <div className="outcomes-tags">
                            {course.outcomes.map((outcome, i) => (
                              <span key={i} className="outcome-tag">
                                {outcome}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="no-outcomes">
                            No outcomes mapped
                          </span>
                        )}
                      </td>

                      <td className="assessment-score">
                        {(
                          course.assessmentScore ||
                          course.assessment_score ||
                          0
                        ).toFixed(1)}
                      </td>
                      <td>
                        <span className={`course-status ${course.status}`}>
                          {course.status === "compliant" ||
                          course.status === "good"
                            ? "Compliant"
                            : "Needs Review"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div className="compliance-content">
            <div className="assessment-methods">
              <h3>Assessment Methods Summary</h3>
              <div className="methods-grid">
                {assessmentData.map((method, index) => (
                  <div key={index} className="method-card">
                    <h4>{method.method}</h4>
                    <p className="method-type">{method.type}</p>
                    <div className="method-stats">
                      <div className="stat">
                        <span className="stat-label">Courses</span>
                        <span className="stat-value">{method.courses}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Completion</span>
                        <span className="stat-value">{method.completion}%</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Avg Score</span>
                        <span className="stat-value">
                          {method.avgScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
