import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const DepartmentForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    faculty_id: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting form data:', formData);
      const response = await api.post('/departments/', formData);
      console.log('Response:', response.data);
      navigate('/departments/');
    } catch (err) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.detail || 'Failed to create department. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="department-form">
      <h2>Add New Department</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Department Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Department Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="faculty_id">Faculty ID (Optional)</label>
          <input
            type="number"
            id="faculty_id"
            name="faculty_id"
            value={formData.faculty_id}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/departments')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Department'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DepartmentForm;
