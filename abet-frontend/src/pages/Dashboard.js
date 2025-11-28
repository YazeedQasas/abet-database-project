import React, { useState, useEffect, useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../context/AuthContext";
import { dashboardAPI } from "../services/dashboardAPI";
import axios from "axios";
import pdfExportService from "../services/pdfExportService";
import logo from "../assets/AISABET.png";
import logoBlack from "../assets/AISABETBlack.png";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [selectedSemester, setSelectedSemester] = useState("Fall 2024");
  const [activeTab, setActiveTab] = useState("overview");

  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    totalPrograms: 0,
    activeAssessments: 0,
    facultyCount: 0,
    studentCount: 0,
    complianceRate: 0,
    outcomesCompliance: 0,
    curriculumCompliance: 0,
    facultyCompliance: 0,
    improvementCompliance: 0,
  });
  const [programs, setPrograms] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // New state for backend data
  const [recentActivities, setRecentActivities] = useState([]);
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
          call: axios.get("http://localhost:8001/api/faculty-training/", {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }),
        }
      );

      if (currentUser) {
        apiCalls.push({
          name: "recentActivities",
          call: dashboardAPI.getRecentActivitiesForDashboard(),
        });
      }

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

              // Update basic stats for PDF export
              if (statsData.basic_stats) {
                setBasicStats(statsData.basic_stats);

                // Update stats state for PDF export
                setStats({
                  totalPrograms: statsData.basic_stats.programs || 0,
                  activeAssessments: statsData.basic_stats.assessments || 0,
                  facultyCount: statsData.basic_stats.departments || 0,
                  studentCount: statsData.basic_stats.courses || 0,
                  complianceRate:
                    statsData.progress_metrics?.find((m) =>
                      m.title?.includes("Student Outcomes")
                    )?.percentage || 0,
                  outcomesCompliance:
                    statsData.progress_metrics?.find((m) =>
                      m.title?.includes("Assessment")
                    )?.percentage || 0,
                  curriculumCompliance:
                    statsData.progress_metrics?.find((m) =>
                      m.title?.includes("Syllabi")
                    )?.percentage || 0,
                  facultyCompliance:
                    statsData.progress_metrics?.find((m) =>
                      m.title?.includes("Faculty")
                    )?.percentage || 0,
                  improvementCompliance: 85,
                });
              }

              // Update programs and assessments for PDF export
              if (statsData.courses_data) {
                setPrograms(statsData.courses_data); // Using courses as programs
              }
              if (statsData.assessment_data) {
                setAssessments(statsData.assessment_data);
              }
              break;

            case "recentActivities":
              const activitiesData = response.value.data;
              setRecentActivities(activitiesData);
              newDashboardData.recentActivities = activitiesData;
              console.log(
                "Recent activities loaded:",
                response.value.data.length
              );
              break;
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

  const processLogoForPDF = async (logoUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = function () {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Set canvas to a reasonable size for PDF
        const targetSize = 100;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Add white background to ensure visibility
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Draw the image scaled to fit
        const scale = Math.min(
          targetSize / this.naturalWidth,
          targetSize / this.naturalHeight
        );
        const scaledWidth = this.naturalWidth * scale;
        const scaledHeight = this.naturalHeight * scale;
        const x = (targetSize - scaledWidth) / 2;
        const y = (targetSize - scaledHeight) / 2;

        ctx.drawImage(this, x, y, scaledWidth, scaledHeight);

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        console.warn("Logo could not be loaded, using fallback");
        resolve(null);
      };

      img.src = logoUrl;
    });
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);

      // Process logo first
      const processedLogo = logoBlack
        ? await processLogoForPDF(logoBlack)
        : null;

      // Extract REAL student outcomes from your dashboardData.abetOutcomes
      const extractRealStudentOutcomes = () => {
        const realOutcomes =
          dashboardData.abetOutcomes.length > 0
            ? dashboardData.abetOutcomes
            : abetOutcomes;

        return realOutcomes.map((outcome) => {
          let score, percentage, status;

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

          const target = outcome.target || outcome.target_score || 4.0;
          if (score >= target) {
            status = score > target ? "Exceeded" : "Target Met";
          } else {
            status = "Below Target";
          }

          return {
            outcome: outcome.id || outcome.label || outcome.name,
            score: score,
            target: target,
            percentage: percentage,
            status: status,
            description:
              outcome.label || outcome.description || "Engineering competency",
          };
        });
      };

      // Calculate actual assessment count from available data
      const calculateAssessmentCount = () => {
        // Try multiple sources for assessment count
        let count = 0;

        // Option 1: Use ABET outcomes as assessments (most reliable)
        if (dashboardData.abetOutcomes?.length > 0) {
          count = dashboardData.abetOutcomes.length;
        }
        // Option 2: Use static abetOutcomes as fallback
        else if (abetOutcomes?.length > 0) {
          count = abetOutcomes.length;
        }
        // Option 3: Count courses with assessment scores
        else if (dashboardData.coursesData?.length > 0) {
          count = dashboardData.coursesData.filter(
            (course) =>
              course.assessmentScore > 0 || course.assessment_score > 0
          ).length;
        }
        // Option 4: Use assessments state if populated
        else if (assessments?.length > 0) {
          count = assessments.length;
        }
        // Option 5: Use basic stats as final fallback
        else {
          count = basicStats.assessments || 0;
        }

        return count;
      };

      const exportData = {
        overview: {
          totalPrograms:
            dashboardData.coursesData?.length || basicStats.programs || 6,
          activeAssessments: calculateAssessmentCount(), // Fixed this line
          facultyCount:
            dashboardData.coursesData?.filter(
              (course) => course.instructor && course.instructor !== "TBD"
            ).length ||
            basicStats.departments ||
            1,
          studentCount:
            dashboardData.coursesData?.reduce(
              (total, course) => total + (course.enrollment || 0),
              0
            ) ||
            basicStats.courses ||
            48,
          complianceRate:
            progressMetrics.find((m) => m.title?.includes("Student Outcomes"))
              ?.percentage || 0,
          lastUpdated: new Date().toLocaleDateString(),
        },

        progressMetrics: {
          courseSyllabiUpdate:
            progressMetrics.find(
              (m) =>
                m.title?.includes("Course Syllabi") ||
                m.title?.includes("Syllabi")
            )?.percentage || 85,
          assessmentDataCollected:
            progressMetrics.find(
              (m) =>
                m.title?.includes("Assessment Data") ||
                m.title?.includes("Assessment")
            )?.percentage || 92,
          studentOutcomesMet:
            progressMetrics.find(
              (m) =>
                m.title?.includes("Student Outcomes") ||
                m.title?.includes("Outcomes")
            )?.percentage || 78,
          facultyTrainingComplete:
            progressMetrics.find(
              (m) =>
                m.title?.includes("Faculty Training") ||
                m.title?.includes("Training")
            )?.percentage || 67,
        },

        studentOutcomes: extractRealStudentOutcomes(),

        courses: (dashboardData.coursesData.length > 0
          ? dashboardData.coursesData
          : coursesData
        ).map((course) => ({
          courseCode: course.code || course.name || "N/A",
          courseName: course.name || course.course_name || "N/A",
          instructor: course.instructor || course.instructor_name || "TBD",
          enrollment: course.enrollment || 0,
          mappedOutcomes: Array.isArray(course.mapped_outcomes)
            ? course.mapped_outcomes
              .map((outcome) =>
                typeof outcome === "object" ? outcome.label : outcome
              )
              .join(", ")
            : Array.isArray(course.outcomes)
              ? course.outcomes.join(", ")
              : "None",
          assessmentScore:
            course.assessmentScore || course.assessment_score || 0,
          status: course.status || "Needs Review",
        })),

        recentActivities: (recentActivities || [])
          .slice(0, 8)
          .map((activity) => ({
            description: activity.target_name
              ? `${activity.action} ${activity.target_name}`
              : activity.description || "System Activity",
            timestamp: activity.timestamp
              ? new Date(activity.timestamp).toLocaleDateString()
              : new Date().toLocaleDateString(),
          })),
      };

      // Debug: Log the assessment count calculation
      console.log("🔍 Assessment Count Debug:", {
        abetOutcomesCount: dashboardData.abetOutcomes?.length || 0,
        staticAbetOutcomesCount: abetOutcomes?.length || 0,
        coursesWithAssessments:
          dashboardData.coursesData?.filter(
            (course) =>
              course.assessmentScore > 0 || course.assessment_score > 0
          ).length || 0,
        assessmentsStateCount: assessments?.length || 0,
        basicStatsAssessments: basicStats.assessments || 0,
        finalCalculatedCount: calculateAssessmentCount(),
      });

      console.log("🔍 Real export data:", {
        studentOutcomes: exportData.studentOutcomes,
        progressMetrics: exportData.progressMetrics,
        courses: exportData.courses.length,
        activities: exportData.recentActivities.length,
      });

      await pdfExportService.generateDashboardReport(exportData, processedLogo);
    } catch (error) {
      console.error("PDF Export Error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setExporting(false);
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
      target: 4.0,
      status: "met",
    },
    {
      id: "SO2",
      label: "Problem Analysis",
      score: 2.8,
      target: 4.0,
      status: "below",
    },
    {
      id: "SO3",
      label: "Design/Development",
      score: 3.4,
      target: 4.0,
      status: "met",
    },
    {
      id: "SO4",
      label: "Investigation",
      score: 3.1,
      target: 4.0,
      status: "met",
    },
    {
      id: "SO5",
      label: "Modern Tool Usage",
      score: 3.6,
      target: 4.0,
      status: "exceeded",
    },
    {
      id: "SO6",
      label: "Professional Responsibility",
      score: 2.9,
      target: 4.0,
      status: "below",
    },
    {
      id: "SO7",
      label: "Communication",
      score: 3.3,
      target: 4.0,
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
            const target = typeof item.target === "number" ? item.target : 4.0;
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

  const CoursePieChart = ({ data, title }) => {
    if (!data || data.length === 0) {
      return (
        <div className="chart-container">
          <h3>{title}</h3>
          <p>No data available</p>
        </div>
      );
    }

    // Calculate total for percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);

    // Generate CSS conic-gradient
    let gradientStops = [];
    let currentPercent = 0;

    data.forEach((item, index) => {
      const percent = (item.value / total) * 100;
      gradientStops.push(
        `${item.color} ${currentPercent}% ${currentPercent + percent}%`
      );
      currentPercent += percent;
    });

    const gradientStyle = {
      background: `conic-gradient(${gradientStops.join(", ")})`,
    };

    return (
      <div className="chart-container">
        <h3>{title}</h3>
        <div className="pie-chart-wrapper">
          <div className="pie-chart" style={gradientStyle}></div>
          <div className="pie-chart-legend">
            {data.map((item, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-label">
                  {item.name}: {item.value} (
                  {((item.value / total) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
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
        target: item.target || item.target_score || 4.0,
        status: item.status || "unknown",
      };

      console.log(`📊 Prepared chart data for ${prepared.id}:`, prepared);
      return prepared;
    });
  };

  const prepareCourseStatusData = (courses) => {
    console.log("🔍 prepareCourseStatusData received:", courses);

    if (!courses || courses.length === 0) {
      console.log("❌ No courses data available");
      return [];
    }

    const statusCounts = { compliant: 0, needsReview: 0, other: 0 };

    courses.forEach((course, index) => {
      const status = course.status?.toLowerCase() || "unknown";
      console.log(`📊 Course ${index + 1}:`, {
        code: course.code,
        name: course.name,
        originalStatus: course.status,
        processedStatus: status,
      });

      if (
        status === "compliant" ||
        status === "good" ||
        status === "excellent"
      ) {
        statusCounts.compliant++;
        console.log(`✅ ${course.code} counted as COMPLIANT`);
      } else if (
        status === "needs-review" ||
        status === "needs_improvement" ||
        status === "needs_assessment"
      ) {
        statusCounts.needsReview++;
        console.log(`⚠️ ${course.code} counted as NEEDS REVIEW`);
      } else {
        statusCounts.other++;
        console.log(
          `❓ ${course.code} fell into OTHER category with status: "${status}"`
        );
      }
    });

    console.log("📈 Final status counts:", statusCounts);

    const result = [
      { name: "Compliant", value: statusCounts.compliant, color: "#28a745" },
      {
        name: "Needs Review",
        value: statusCounts.needsReview,
        color: "#ffc107",
      },
      { name: "Other", value: statusCounts.other, color: "#6c757d" },
    ].filter((item) => item.value > 0);

    console.log("🎯 Pie chart data result:", result);
    return result;
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
            <button
              className="export-btn"
              onClick={handleExportPDF}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Generating PDF...
                </>
              ) : (
                <>
                  <i className="fas fa-download"></i>
                  Export Report
                </>
              )}
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
                let displayTarget = metric.target;
                let displayStatus = metric.status;
                let displayDetails = null;
                let isStudentOutcomes = false;

                // FIXED: Proper status determination based on percentage vs target
                const percentage = displayValue;
                const targetValue =
                  parseInt(
                    displayTarget?.replace("Target ", "").replace("%", "")
                  ) || 90;

                // Universal status logic based on performance vs target
                if (percentage >= targetValue) {
                  displayStatus = percentage >= 95 ? "excellent" : "good"; // ✅ Green for meeting target
                } else if (percentage >= targetValue * 0.8) {
                  // 80% of target
                  displayStatus = "warning"; // ✅ Yellow for approaching target
                } else {
                  displayStatus = "critical"; // ✅ Red for below target
                }

                // Special handling for Student Outcomes (10/10 format)
                if (
                  metric.title === "Student Outcomes Met" ||
                  metric.name === "Student Outcomes Met"
                ) {
                  isStudentOutcomes = true;
                  displayValue = `${metric.current}/${metric.total}`;
                  displayTarget = `Target: ${metric.target}`;
                  displayDetails = `${metric.current} of ${metric.total} outcomes meeting threshold`;

                  // FIXED: Proper target parsing for "8/10" format
                  const ratio = metric.current / metric.total; // 10/10 = 1.0

                  let targetRatio;
                  if (metric.target.includes("/")) {
                    // Handle "8/10" format
                    const [targetNum, targetDenom] = metric.target
                      .split("/")
                      .map((num) => parseInt(num.trim()));
                    targetRatio = targetNum / targetDenom; // 8/10 = 0.8
                  } else {
                    // Handle simple number format like "8"
                    const targetNum = parseInt(
                      metric.target.replace(/\D/g, "")
                    );
                    targetRatio = targetNum / metric.total; // fallback
                  }

                  // Clear status logic: 10/10 >= 8/10 should be "good"
                  if (ratio >= targetRatio) {
                    displayStatus = ratio === 1.0 ? "excellent" : "good"; // ✅ Green for 10/10
                  } else if (ratio >= targetRatio * 0.8) {
                    displayStatus = "warning"; // ✅ Yellow
                  } else {
                    displayStatus = "critical"; // ✅ Red
                  }
                }

                // Special handling for Faculty Training with real-time data
                else if (
                  metric.title === "Faculty Training Complete" ||
                  metric.name === "Faculty Training Complete"
                ) {
                  if (realTimeStats) {
                    displayValue = realTimeStats.completionRate;
                    displayDetails = `${realTimeStats.completed} of ${realTimeStats.total} completed`;
                    // Faculty Training target is 95%
                    displayStatus =
                      displayValue >= 95
                        ? "excellent"
                        : displayValue >= 80
                          ? "good"
                          : displayValue >= 60
                            ? "warning"
                            : "critical";
                  }
                  displayTarget = `Target: ${metric.target}%`;
                }

                // For all other metrics, add "Target: " prefix
                else {
                  displayTarget = `Target: ${metric.target}%`;
                }

                return (
                  <div key={index} className="metric-card">
                    <div className="metric-header">
                      <h3>{metric.title || metric.name}</h3>
                      <span
                        className={`status-indicator ${displayStatus}`}
                      ></span>{" "}
                      {/* ✅ Now uses correct status */}
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
                          width: `${isStudentOutcomes
                            ? (metric.current / metric.total) * 100
                            : Math.min(displayValue, 100)
                            }%`,
                        }}
                      ></div>
                    </div>
                    {displayDetails && (
                      <div className="metric-details">{displayDetails}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Split Section: Activities & Compliance */}
            <div className="overview-split-section">
              {/* Recent Assessment Activities */}
              <div className="recent-activities">
                <div className="activities-header">
                  <h3>Recent Assessment Activities</h3>
                  <button
                    className="view-all-btn"
                    onClick={() => (window.location.href = "/audit-logs")}
                  >
                    <i className="fas fa-external-link-alt"></i>
                    View All Audit Logs
                  </button>
                </div>

                <div className="activity-timeline">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((log, index) => {
                      // Helper function to get activity icon based on action
                      const getActivityIcon = (action) => {
                        switch (action?.toUpperCase()) {
                          case "CREATE":
                            return "completed";
                          case "UPDATE":
                            return "pending";
                          case "DELETE":
                            return "warning";
                          default:
                            return "completed";
                        }
                      };

                      // Helper function to format activity title - more descriptive
                      const getActivityTitle = (log) => {
                        const action = log.action?.toUpperCase() || "UNKNOWN";
                        const targetName =
                          log.target_name ||
                          `${log.target_model} ${log.target_id}`;

                        switch (action) {
                          case "CREATE":
                            return `Created ${targetName}`;
                          case "UPDATE":
                            return `Updated ${targetName}`;
                          case "DELETE":
                            return `Deleted ${targetName}`;
                          default:
                            return `${action} ${targetName}`;
                        }
                      };

                      // Helper function to get activity description with username
                      const getActivityDescription = (log) => {
                        const username = log.username || "Unknown user";
                        const action =
                          log.action?.toLowerCase() || "performed action on";
                        const model = log.target_model?.toLowerCase() || "item";
                        const id = log.target_id || "";

                        // Create more natural language descriptions
                        switch (log.action?.toUpperCase()) {
                          case "CREATE":
                            return `${username} has created ${model} ${id}`;
                          case "UPDATE":
                            return `${username} has updated ${model} ${id}`;
                          case "DELETE":
                            return `${username} has deleted ${model} ${id}`;
                          default:
                            return `${username} has ${action} ${model} ${id}`;
                        }
                      };

                      // Helper function to format timestamp
                      const formatTimestamp = (timestamp) => {
                        const date = new Date(timestamp);
                        const now = new Date();
                        const diffInHours = Math.floor(
                          (now - date) / (1000 * 60 * 60)
                        );

                        if (diffInHours < 1) {
                          const diffInMinutes = Math.floor(
                            (now - date) / (1000 * 60)
                          );
                          return diffInMinutes <= 1
                            ? "Just now"
                            : `${diffInMinutes} minutes ago`;
                        } else if (diffInHours < 24) {
                          return `${diffInHours} hour${diffInHours > 1 ? "s" : ""
                            } ago`;
                        } else {
                          const diffInDays = Math.floor(diffInHours / 24);
                          return `${diffInDays} day${diffInDays > 1 ? "s" : ""
                            } ago`;
                        }
                      };

                      return (
                        <div
                          key={log.id || index}
                          className={`activity-item ${getActivityIcon(
                            log.action
                          )}`}
                        >
                          <div
                            className={`activity-marker ${getActivityIcon(
                              log.action
                            )}`}
                          ></div>
                          <div className="activity-content">
                            <h4>{getActivityTitle(log)}</h4>
                            <p>{getActivityDescription(log)}</p>
                            <span className="activity-time">
                              {formatTimestamp(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-activities">
                      <p>No recent activities found</p>
                    </div>
                  )}
                </div>
              </div>

              <CoursePieChart
                data={prepareCourseStatusData(
                  dashboardData.coursesData.length > 0
                    ? dashboardData.coursesData
                    : coursesData
                )}
                title="Course Compliance Status Distribution"
              />
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

                const target = outcome.target || outcome.target_score || 4.0;
                const targetPercentage = (target / 4.0) * 100;

                return (
                  <div key={index} className="outcome-card">
                    <div className="outcome-header">
                      <h3>
                        {outcome.id || outcome.label || `Outcome ${index + 1}`}
                      </h3>
                      <span
                        className={`outcome-status ${outcome.status || "unknown"
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
                        {(typeof target === "number" ? target : 4.0).toFixed(1)}
                      </span>
                    </div>
                    {/* FIXED: Change from outcome-progress to progress-bar */}
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${outcome.status || "unknown"
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
                    <th>Actions</th>
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
                                className={`outcome-badge ${typeof outcome === "object"
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
                      <td>
                        <Link
                          to={`/courses/${course.code.toLowerCase()}/questions`}
                          className="action-btn"
                        >
                          Manage Questions
                        </Link>
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
