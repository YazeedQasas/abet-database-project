import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>ABET Accreditation Assessment System - AQU</h1>
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/programs">Programs</Link></li>
            <li><Link to="/assessments">Assessments</Link></li>
            <li><Link to="/departments">Departments</Link></li>
            <li><Link to="/reports">Reports</Link></li>
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
