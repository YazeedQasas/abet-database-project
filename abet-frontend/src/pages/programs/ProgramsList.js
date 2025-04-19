import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './ProgramsList.css';

const ProgramsList = () => {
  const [programs, setPrograms] = useState([]);
  const [programAverages, setProgramAverages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const [programsRes, avgRes] = await Promise.all([
          api.get('/programs/'),
          api.get('/assessments/program-averages/')
        ]);

        setPrograms(programsRes.data);

        const avgMap = {};
        avgRes.data.forEach((avg) => {
          avgMap[avg.program_id] = {
            average_score: avg.average_score,
            status: avg.is_abet_accredited ? 'ABET Accredited' : 'Not Accredited'
          };
        });

        setProgramAverages(avgMap);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch programs');
        setLoading(false);
        console.error(err);
      }
    };

    fetchPrograms();
  }, []);

  const getComplianceColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 80) return '#FFC107';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getComplianceStatus = (score) => {
    if (score >= 90) return 'ABET Accredited';
    if (score >= 80) return 'Near Accreditation';
    if (score >= 70) return 'Needs Improvement';
    return 'At Risk';
  };

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

              {programAverages[program.id] ? (
                <div className="program-score">
                  <strong>Average Score:</strong> {programAverages[program.id].average_score}%
                  <br />
                  <span style={{ color: getComplianceColor(programAverages[program.id].average_score) }}>
                    {getComplianceStatus(programAverages[program.id].average_score)}
                  </span>
                </div>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>No assessments yet</p>
              )}

              <Link to={`/programs/${program.id}`}>View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramsList;
