import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await api.get(`/programs/${id}/`);
        setProgram(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch program details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProgram();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/programs/${id}/`);
        navigate('/programs');
      } catch (err) {
        setError('Failed to delete program');
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading program details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!program) return <div>Program not found</div>;

  return (
    <div className="program-detail">
      <div className="program-header">
        <h2>{program.name}</h2>
        <div className="program-actions">
          <Link to={`/programs/${id}/edit`} className="btn-edit">Edit</Link>
          <button onClick={handleDelete} className="btn-delete">Delete</button>
        </div>
      </div>
      
      <div className="program-info">
        <h3>Description</h3>
        <p>{program.description}</p>
        
        <h3>Department</h3>
        <p>{program.department}</p>
        
        <h3>Level</h3>
        <p>{program.level === 'B' ? 'Baccalaureate' : 
            program.level === 'M' ? 'Masters' : 'Integrated Baccalaureate-Masters'}</p>
      </div>
      
      <div className="program-sections">
        <div className="section-card">
          <h3>Educational Objectives</h3>
          <Link to={`/programs/${id}/objectives`}>View Objectives</Link>
        </div>
        
        <div className="section-card">
          <h3>Courses</h3>
          <Link to={`/programs/${id}/courses`}>View Courses</Link>
        </div>
        
        <div className="section-card">
          <h3>Learning Outcomes</h3>
          <Link to={`/programs/${id}/outcomes`}>View Outcomes</Link>
        </div>
        
        <div className="section-card">
          <h3>Assessments</h3>
          <Link to={`/programs/${id}/assessments`}>View Assessments</Link>
        </div>
      </div>
      
      <Link to="/programs" className="btn-back">Back to Programs</Link>
    </div>
  );
};

export default ProgramDetail;
