import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUniversity, FaClipboardList, FaBookOpen } from 'react-icons/fa';
import { MdAssessment } from 'react-icons/md';
import './ProgramDetail.css';

const ProgramDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [averageData, setAverageData] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programRes, avgRes, assessmentsRes] = await Promise.all([
          api.get(`/programs/${id}/`),
          api.get(`/assessments/program/${id}/average/`),
          api.get(`/assessments/?program_id=${id}`)
        ]);
        setProgram(programRes.data);
        setAverageData(avgRes.data);
        setAssessments(assessmentsRes.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch program details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
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

  if (loading) return <div className="dashboard loading"><div className="loader"></div><p>Loading program data...</p></div>;
  if (error) return <div className="dashboard loading">Error: {error}</div>;

  return (
    <div className="dashboard split-layout">
      <div className="left-panel">
        <div className="overview-card">
          <h2><FaUniversity /> {program.name}</h2>
          <p><strong>Department:</strong> {program.department}</p>
          <p><strong>Level:</strong> {program.level === 'B' ? 'Baccalaureate' : 'Masters'}</p>

          <div className="score-chart">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831" />
              {averageData && (
                <path
                  className="circle"
                  strokeDasharray={`${averageData.average_score},100`}
                  style={{ stroke: getComplianceColor(averageData.average_score) }}
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              )}
              <text x="18" y="18" className="percentage">
                {averageData ? `${Math.round(averageData.average_score)}%` : 'N/A'}
              </text>
            </svg>
            <p className="status-text" style={{ color: getComplianceColor(averageData?.average_score) }}>
              {getComplianceStatus(averageData?.average_score)}
            </p>
          </div>
        </div>

        <div className="button-group">
          <Link to={`/programs/${id}/edit`} className="btn secondary">Edit</Link>
          <button onClick={handleDelete} className="btn secondary">Delete</button>
          <Link to="/programs" className="btn secondary">Back</Link>
        </div>
      </div>

      <div className="right-panel">
        <div className="card-grid">
          {[
            { title: 'Courses', icon: <FaBookOpen />, link: `/programs/${id}/courses` },
            { title: 'Objectives', icon: <FaClipboardList />, link: `/programs/${id}/objectives` },
            { title: 'Learning Outcomes', icon: <MdAssessment />, link: `/programs/${id}/outcomes` },
            { title: 'Assessments', icon: <MdAssessment />, link: `/programs/${id}/assessments` },
          ].map(({ title, icon, link }) => (
            <Link to={link} key={title} className="quick-tile">
              <div className="icon-circle">{icon}</div>
              <span>{title}</span>
            </Link>
          ))}
        </div>

        <div className="assessment-history">
          <h3>Assessment History</h3>
          {assessments.length === 0 ? (
            <p>No assessments recorded yet for this program.</p>
          ) : (
            <ul>
              {assessments.map((assessment) => (
                <li key={assessment.id}>
                  <strong>{assessment.name}</strong> – {new Date(assessment.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramDetail;
