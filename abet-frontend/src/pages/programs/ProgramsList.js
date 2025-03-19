import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ProgramsList = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs/');
        setPrograms(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch programs');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPrograms();
  }, []);

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="programs-list">
      <h2>Programs</h2>
      <Link to="/programs/new" className="btn-add">Add New Program</Link>
      
      {programs.length === 0 ? (
        <p>No programs found. Create your first program.</p>
      ) : (
        <div className="programs-grid">
          {programs.map(program => (
            <div key={program.id} className="program-card">
              <h3>{program.name}</h3>
              <p>{program.description.substring(0, 100)}...</p>
              <Link to={`/programs/${program.id}`}>View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsList;
