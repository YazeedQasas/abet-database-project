// src/components/layout/Layout.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>ABET Accreditation Assessment System</h1>
          <div className="user-info">
            {currentUser && (
              <>
                <span className="user-name">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                  {currentUser && currentUser.userType && (
                  <span className="user-role">
                    ({currentUser.userType.charAt(0).toUpperCase() + currentUser.userType.slice(1)})
                  </span>
                )}
                <button onClick={handleLogout} className="btn-logout">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/programs">Programs</Link></li>
            <li><Link to="/assessments">Assessments</Link></li>
            <li><Link to="/departments">Departments</Link></li>
            <li><Link to="/reports">Reports</Link></li>
            {currentUser && currentUser.userType === 'admin' && (
              <li><Link to="/users">User Management</Link></li>
            )}
          </ul>
        </nav>
      </header>
      <main className="app-content">
        {children}
      </main>
      <footer className="app-footer">
        <p>ABET Assessment System © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Layout;
