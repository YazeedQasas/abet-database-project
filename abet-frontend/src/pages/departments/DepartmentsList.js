import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  FaPlus,
  FaSearch,
  FaUniversity,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import { MdBusiness } from "react-icons/md";
import "./DepartmentsList.css";

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterDepartments();
  }, [departments, searchTerm]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/departments/");
      setDepartments(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch departments");
      console.error("Departments fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterDepartments = () => {
    let filtered = departments;

    if (searchTerm) {
      filtered = filtered.filter(
        (department) =>
          department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          department.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleDelete = async (departmentId, departmentName) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${departmentName}"? This action cannot be undone.`
      )
    ) {
      try {
        await api.delete(`/departments/${departmentId}/`);
        fetchDepartments(); // Refresh the list
      } catch (err) {
        console.error("Delete error:", err);
        setError("Failed to delete department");
      }
    }
  };

  if (loading) {
    return (
      <div className="departments-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h3>Loading Departments</h3>
          <p>Please wait while we fetch the department data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="departments-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Departments</h3>
          <p>{error}</p>
          <button onClick={fetchDepartments} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="departments-container">
      {/* Header Section */}
      <div className="departments-header">
        <div className="header-content">
          <div className="header-left">
            <div className="page-title">
              <div className="title-icon">
                <MdBusiness />
              </div>
              <div className="title-content">
                <h1>Department Management</h1>
                <p>Manage academic departments and organizational structure</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <Link to="/departments/new" className="btn-primary">
              <FaPlus />
              <span>New Department</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon total">
            <MdBusiness />
          </div>
          <div className="stat-content">
            <h3>Total Departments</h3>
            <p className="stat-number">{departments.length}</p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Departments Content */}
      <div className="departments-content">
        {filteredDepartments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏛️</div>
            <h3>No Departments Found</h3>
            <p>
              {departments.length === 0
                ? "Start by creating your first department."
                : "Try adjusting your search criteria."}
            </p>
            {departments.length === 0 && (
              <Link to="/departments/new" className="btn-create">
                Create Department
              </Link>
            )}
          </div>
        ) : (
          <div className="departments-grid">
            {filteredDepartments.map((department) => (
              <div key={department.id} className="department-card">
                <div className="card-header">
                  <div className="department-title">
                    <div className="department-icon">
                      <FaUniversity />
                    </div>
                    <div className="title-info">
                      <h3>{department.name}</h3>
                      {department.email && (
                        <div className="department-meta">
                          <div className="meta-item">
                            <FaEnvelope className="meta-icon" />
                            <span>{department.email}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <Link
                    to={`/departments/${department.id}`}
                    className="btn-action view"
                    title="View Details"
                  >
                    <FaEye />
                    <span>View</span>
                  </Link>
                  <Link
                    to={`/departments/${department.id}/edit`}
                    className="btn-action edit"
                    title="Edit Department"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(department.id, department.name)}
                    className="btn-action delete"
                    title="Delete Department"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsList;
