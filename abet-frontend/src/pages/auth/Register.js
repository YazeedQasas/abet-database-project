import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Auth.css';
import aislogo from '../../assets/AISABET.png'; // Import your logo

const Register = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    user_type: 'faculty',
    department: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        if (isMounted) {
          setDepartments(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch departments', err);
      }
    };
    
    fetchDepartments();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'department' ? parseInt(value) : value  
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log("Submitting register form:", formData);

    try {
      await api.post('/auth/register/', formData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 500) {
        navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
      } else {
        const errorMessages = [];
        const errors = err.response?.data || {};
        
        Object.keys(errors).forEach(key => {
          const messages = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
          messages.forEach(message => {
            errorMessages.push(`${key}: ${message}`);
          });
        });
        
        setError(errorMessages.join('\n') || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-decorative-bg">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="auth-form-container register-form">
        <div className="auth-header">
          <img src={aislogo} alt="ABET Tracker" className="auth-logo" />
          <h2>Join Our Community</h2>
          <p className="auth-subtitle">Create your ABET Assessment System account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choose a username"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  placeholder="Last name"
                />
              </div>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="user_type">Role</label>
              <div className="input-wrapper">
                <select
                  id="user_type"
                  name="user_type"
                  value={formData.user_type}
                  onChange={handleChange}
                  required
                >
                  <option value="faculty">Faculty</option>
                  <option value="evaluator">Program Evaluator</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <div className="input-wrapper">
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a strong password"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <div className="input-wrapper">
              <input
                type="password"
                id="password2"
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>
          
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="auth-links">
          <p>Already have an account? <Link to="/login" className="auth-link">Sign in here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
