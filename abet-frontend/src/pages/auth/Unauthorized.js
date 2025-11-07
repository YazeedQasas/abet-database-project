// src/pages/auth/Unauthorized.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const Unauthorized = () => {
  return (
    <div className="auth-container">
      <div className="auth-message-container">
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
        <p>Please contact an administrator if you believe this is an error.</p>
        <div className="auth-links">
          <Link to="/" className="btn-primary">Return to Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
