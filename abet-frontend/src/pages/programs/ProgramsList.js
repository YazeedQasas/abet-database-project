import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./ProgramsList.css";

const ProgramsList = () => {
  const [programs, setPrograms] = useState([]);
  const [programAverages, setProgramAverages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const [programsRes, avgRes] = await Promise.all([
          api.get("/programs/"),
          api.get("/assessments/program-averages/"),
        ]);

        setPrograms(programsRes.data);

        const avgMap = {};
        avgRes.data.forEach((avg) => {
          avgMap[avg.program_id] = {
            average_score: avg.average_score,
            status: avg.is_abet_accredited
              ? "ABET Accredited"
              : "Not Accredited",
          };
        });

        setProgramAverages(avgMap);
      } catch (err) {
        setError("Failed to fetch programs");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const getComplianceColor = (score) => {
    if (score >= 90) return "#ff6f2d";
    if (score >= 80) return "#ffb347";
    if (score >= 70) return "#ffd700";
    return "#ff4757";
  };

  const getComplianceStatus = (score) => {
    if (score >= 90) return "ABET Accredited";
    if (score >= 80) return "Near Accreditation";
    if (score >= 70) return "Needs Improvement";
    return "At Risk";
  };

  const getStatusIcon = (score) => {
    if (score >= 90) return "fas fa-certificate";
    if (score >= 80) return "fas fa-clock";
    if (score >= 70) return "fas fa-exclamation-triangle";
    return "fas fa-times-circle";
  };

  // Enhanced filter function with search
  const filteredPrograms = programs.filter((program) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      program.name.toLowerCase().includes(searchLower) ||
      program.description.toLowerCase().includes(searchLower);

    if (filterStatus === "all") return matchesSearch;

    const programScore = programAverages[program.id]?.average_score || 0;
    const status = getComplianceStatus(programScore);

    return (
      matchesSearch && status.toLowerCase().includes(filterStatus.toLowerCase())
    );
  });

  if (loading) {
    return (
      <div className="programs-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="programs-dashboard">
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            <h3>Error Loading Programs</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="retry-btn"
            >
              <i className="fas fa-redo"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="programs-dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Academic Programs</h1>
            <p>ABET Accreditation Management & Assessment</p>
          </div>
          <div className="header-controls">
            <Link to="/programs/new" className="export-btn">
              <i className="fas fa-plus"></i>
              Add New Program
            </Link>
          </div>
        </div>
      </header>

      {/* Controls Section with Search */}
      <div className="programs-controls">
        <div className="search-container">
          {/* Replace FontAwesome icon with HTML entity */}
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search programs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="clear-search-btn"
              type="button"
            >
              <span>✕</span>
            </button>
          )}
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="semester-select"
        >
          <option value="all">All Programs</option>
          <option value="accredited">ABET Accredited</option>
          <option value="near">Near Accreditation</option>
          <option value="improvement">Needs Improvement</option>
          <option value="risk">At Risk</option>
        </select>
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="search-results-info">
          <p>
            Found {filteredPrograms.length} program
            {filteredPrograms.length !== 1 ? "s" : ""}
            matching "{searchTerm}"
          </p>
          {searchTerm && filteredPrograms.length === 0 && (
            <p className="no-results">
              Try adjusting your search terms or filters
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Stats Overview */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-header">
              <h3>Total Programs</h3>
              <span className="status-indicator good"></span>
            </div>
            <div className="metric-value">
              <span className="percentage">{programs.length}</span>
              <span className="target">Active Programs</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>ABET Accredited</h3>
              <span className="status-indicator good"></span>
            </div>
            <div className="metric-value">
              <span className="percentage">
                {
                  programs.filter((p) => {
                    const score = programAverages[p.id]?.average_score || 0;
                    return score >= 90;
                  }).length
                }
              </span>
              <span className="target">Programs Meeting Standards</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-header">
              <h3>Average Score</h3>
              <span className="status-indicator warning"></span>
            </div>
            <div className="metric-value">
              <span className="percentage">
                {programs.length > 0
                  ? Math.round(
                      Object.values(programAverages).reduce(
                        (sum, avg) => sum + (avg.average_score || 0),
                        0
                      ) / Math.max(Object.keys(programAverages).length, 1)
                    )
                  : 0}
                %
              </span>
              <span className="target">Overall Performance</span>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        {filteredPrograms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3>No Programs Found</h3>
            <p>
              {programs.length === 0
                ? "Create your first academic program to get started."
                : searchTerm
                ? `No programs match your search for "${searchTerm}"`
                : "No programs match your current filter criteria."}
            </p>
            {programs.length === 0 && (
              <Link to="/programs/new" className="export-btn">
                <i className="fas fa-plus"></i>
                Create First Program
              </Link>
            )}
          </div>
        ) : (
          <div className="programs-grid">
            {filteredPrograms.map((program) => {
              const programData = programAverages[program.id];
              const score = programData?.average_score || 0;
              const status = getComplianceStatus(score);

              return (
                <div key={program.id} className="program-card">
                  <div className="program-header">
                    <div className="program-title">
                      <h3>{program.name}</h3>
                      <span className="program-level">
                        {program.level === "B" ? "Baccalaureate" : "Masters"}{" "}
                        Program
                      </span>
                    </div>
                    <div
                      className={`status-badge ${status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      <i className={getStatusIcon(score)}></i>
                      {status}
                    </div>
                  </div>

                  <div className="program-content">
                    <p className="program-description">
                      {program.description.length > 120
                        ? `${program.description.substring(0, 120)}...`
                        : program.description}
                    </p>

                    {programData ? (
                      <div className="program-metrics">
                        <div className="assessment-score">
                          <span className="score-label">Assessment Score</span>
                          <div className="score-display">
                            <span
                              className="score-number"
                              style={{ color: getComplianceColor(score) }}
                            >
                              {score.toFixed(1)}%
                            </span>
                            <div className="progress-bar-container">
                              <div
                                className="progress-bar met"
                                style={{
                                  width: `${Math.min(score, 100)}%`,
                                  background: `linear-gradient(135deg, ${getComplianceColor(
                                    score
                                  )}, #ff8c42)`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-data">
                        <i className="fas fa-info-circle"></i>
                        <span>No assessment data available</span>
                      </div>
                    )}
                  </div>

                  <div className="program-actions">
                    <Link to={`/programs/${program.id}`} className="view-btn">
                      <i className="fas fa-eye"></i>
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProgramsList;
