import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './DepartmentsList.css';

const DepartmentsList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get('/departments/');
        setDepartments(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch departments');
        setLoading(false);
        console.error(err);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) return <div>Loading departments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="departments-list">
  <h2>Departments</h2>
  <Link to="/departments/new" className="btn-add">Add New Department</Link>

  {departments.length === 0 ? (
    <p>No departments found. Create your first department.</p>
  ) : (
    <div className="departments-grid">
      {departments.map(dept => (
        <div className="department-card" key={dept.id}>
          <h3>{dept.name}</h3>
          <p>{dept.email}</p>
          <Link to={`/departments/${dept.id}`}>View Details →</Link>
        </div>
      ))}
    </div>
  )}
</div>
  );
};

export default DepartmentsList;
