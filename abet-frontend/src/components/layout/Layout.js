// src/components/layout/Layout.js
import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Layout.css";
import logo from "../../assets/AISABET.png";
import {
  FaTachometerAlt,
  FaBook,
  FaBuilding,
  FaUniversity,
  FaClipboardList,
  FaUsers,
  FaArchive,
  FaBars,
  FaBell,
  FaSearch,
  FaCog,
  FaGraduationCap,
} from "react-icons/fa";
import {
  MdAssessment,
  MdOutlineReport,
  MdAdminPanelSettings,
} from "react-icons/md";
import axios from "axios";

const Layout = ({ children }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlelogout = async () => {
    try {
      await axios.post(
        "http://localhost:8001/api/logout/",
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const navItems = [
    { path: "/Dashboard", icon: FaTachometerAlt, label: "Dashboard" },
    { path: "/programs", icon: FaUniversity, label: "Programs" },
    { path: "/assessments", icon: MdAssessment, label: "Assessments" },
    { path: "/departments", icon: FaBuilding, label: "Departments" },
    {
      path: "/faculty-training",
      icon: FaGraduationCap,
      label: "Faculty Training",
    },
    { path: "/reports", icon: MdOutlineReport, label: "Reports" },
    { path: "http://localhost:8080/", icon: FaArchive, label: "Archive" },
    ...(currentUser?.userType === "admin"
      ? [
          {
            path: "/AdminDashboard",
            icon: MdAdminPanelSettings,
            label: "Admin Dashboard",
          },
        ]
      : []),
  ];

  return (
    <div className="layout-container">
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src={logo} alt="Logo" />
            {!sidebarCollapsed && (
              <div className="logo-text">
                <h2>ABET</h2>
                <span>Assessment System</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li
                  key={index}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Link to={item.path} className="nav-link">
                    <div className="nav-icon">
                      <IconComponent />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="nav-label">{item.label}</span>
                    )}
                    {isActive && <div className="active-indicator"></div>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && (
            <div className="user-profile-sidebar">
              <div className="user-avatar">
                {currentUser?.firstName?.[0]}
                {currentUser?.lastName?.[0]}
              </div>
              <div className="user-details">
                <span className="user-name">
                  {currentUser?.firstName} {currentUser?.lastName}
                </span>
                <span className="user-role">{currentUser?.userType}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="main-section">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="breadcrumb">
              <span>ABET Assessment</span>
            </div>
          </div>

          <div className="topbar-center">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                className="search-input"
              />
            </div>
          </div>

          <div className="topbar-right">
            <div className="notifications">
              <FaBell />
              <span className="notification-badge">3</span>
            </div>

            <div className="user-menu">
              <div className="user-info">
                {currentUser && (
                  <>
                    <div className="user-avatar-header">
                      {currentUser.firstName?.[0]}
                      {currentUser.lastName?.[0]}
                    </div>
                    <div className="user-details-header">
                      <span className="user-name">
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                      <span className="user-role">
                        ({currentUser.userType})
                      </span>
                    </div>
                  </>
                )}
              </div>
              <button className="logout-btn" onClick={handlelogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="main-content">
          <div className="content-wrapper">{children}</div>
        </main>

        <footer className="app-footer">
          <p>ABET Assessment System © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
