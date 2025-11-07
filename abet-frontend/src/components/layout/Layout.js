// src/components/layout/Layout.js
import { useContext, useState } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

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
    { path: "/archive", icon: FaArchive, label: "Archive" }, // Improv 1
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

  // ✅ NEW: Search functionality
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigateToPage(searchTerm.trim());
    }
  };

  const navigateToPage = (term) => {
    const lowerTerm = term.toLowerCase();

    // Find matching navigation item
    const matchingItem = navItems.find(
      (item) =>
        item.label.toLowerCase().includes(lowerTerm) ||
        item.path.toLowerCase().includes(lowerTerm)
    );

    if (matchingItem) {
      if (matchingItem.path.startsWith("http")) {
        // External link (Archive)
        window.open(matchingItem.path, "_blank");
      } else {
        navigate(matchingItem.path);
      }
      setSearchTerm("");
      setShowSearchSuggestions(false);
    } else {
      // Optional: Show "No results found" or handle custom search logic
      console.log(`No matching page found for: ${term}`);
    }
  };

  const getFilteredSuggestions = () => {
    if (!searchTerm) return [];

    return navItems
      .filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5); // Limit to 5 suggestions
  };

  const handleSuggestionClick = (item) => {
    if (item.path.startsWith("http")) {
      window.open(item.path, "_blank");
    } else {
      navigate(item.path);
    }
    setSearchTerm("");
    setShowSearchSuggestions(false);
  };

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
            {/* ✅ UPDATED: Enhanced search container */}
            <div className="search-container">
              <form onSubmit={handleSearchSubmit}>
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search pages..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() =>
                    setShowSearchSuggestions(searchTerm.length > 0)
                  }
                  onBlur={() =>
                    setTimeout(() => setShowSearchSuggestions(false), 200)
                  }
                />
              </form>

              {/* ✅ NEW: Search suggestions dropdown */}
              {showSearchSuggestions && (
                <div className="search-suggestions">
                  {getFilteredSuggestions().map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className="search-suggestion-item"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <IconComponent className="suggestion-icon" />
                        <span>{item.label}</span>
                      </div>
                    );
                  })}
                  {getFilteredSuggestions().length === 0 && (
                    <div className="search-suggestion-item no-results">
                      No matching pages found
                    </div>
                  )}
                </div>
              )}
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
