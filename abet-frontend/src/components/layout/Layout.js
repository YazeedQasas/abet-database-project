// src/components/layout/Layout.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Layout.css';
import logo from '../../assets/white-logo.png';
import { FaTachometerAlt, FaBook, FaBuilding, FaUniversity, FaClipboardList, FaUsers,FaArchive } from 'react-icons/fa';
import { MdAssessment, MdOutlineReport } from 'react-icons/md';
import axios from 'axios';

const Layout = ({ children }) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handlelogout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/logout/',
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        }
      );
  
      // ✅ Clear token on logout
      localStorage.removeItem('token');
      window.location.href = '/login'; // or route change
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
          <h2>ABET</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/"><FaTachometerAlt /> Dashboard</Link></li>
            <li><Link to="/programs"><FaUniversity /> Programs</Link></li>
            <li><Link to="/assessments"><MdAssessment /> Assessments</Link></li>
            <li><Link to="/departments"><FaBuilding /> Departments</Link></li>
            <li><Link to="/reports"><MdOutlineReport /> Reports</Link></li>
            <li><Link to="/archive"><FaArchive /> Archive</Link></li>
            {currentUser?.userType === 'admin' && (
              <li><Link to="/users"><FaUsers /> Users</Link></li>
            )}
          </ul>
        </nav>
      </aside>
      <div className="main-section">
        <header className="topbar">
          <div className="user-info">
            {currentUser && (
              <>
                <span>{currentUser.firstName} {currentUser.lastName}</span>
                {currentUser.userType && (
                  <span className="role">({currentUser.userType})</span>
                )}
                <button onClick={handlelogout}>Logout</button>
              </>
            )}
          </div>
        </header>
        <main className="main-content">
            <div className="content-wrapper">
              {children}
            </div>
        </main>
        <footer className="app-footer">
          <p>ABET Assessment System © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
