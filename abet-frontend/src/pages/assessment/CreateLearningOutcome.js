import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import './CreateLearningOutcome.css';

const CreateLearningOutcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessment_id');

  const [formData, setFormData] = useState({
    description: '',
    program_id: '',
  });

  const [abetOutcomes, setAbetOutcomes] = useState([]);
  const [selectedAbet, setSelectedAbet] = useState([]);
  const [errors, setErrors] = useState(null);

  useEffect(() => {
    const fetchAbetOutcomes = async () => {
      try {
        const response = await api.get('/abetoutcome/');
        console.log("ABET Outcomes response:", response.data);
        setAbetOutcomes(response.data);
      } catch (error) {
        console.error('Failed to fetch ABET outcomes:', error);
      }
    };
    fetchAbetOutcomes();
  }, []);

  const handleSelectChange = (index, field, value) => {
    const updated = [...selectedAbet];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedAbet(updated);
  };

  const addAbetRow = () => {
    setSelectedAbet([...selectedAbet, { abet_outcome: '', score: 1, evidence_type: 'direct' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        description: formData.description,
        program_id: parseInt(formData.program_id, 10),
        assessment: parseInt(assessmentId, 10),
        abet_outcomes_scores: selectedAbet.map(entry => ({
          abet_outcome: parseInt(entry.abet_outcome, 10),
          score: parseInt(entry.score),
          evidence_type: entry.evidence_type
        }))
      };

      console.log("Submitting payload:", payload);
      await api.post('/learning-outcomes/', payload);
      navigate(`/assessments/${assessmentId}`);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrors('Submission failed.');
    }
  };

  return (
    <div className="assessment-detail">
      <div className="dashboard-header">
        <h1>Create Learning Outcome</h1>
        <p>Provide a description and program ID for this learning outcome.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {errors && <p className="error">{errors}</p>}
        <textarea
          placeholder="Learning Outcome Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Program ID"
          value={formData.program_id}
          onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
        />

        <h3>Align with ABET Outcomes</h3>
        {selectedAbet.map((row, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <select
              name="abet_outcome"
              value={row.abet_outcome}
              onChange={(e) => handleSelectChange(index, 'abet_outcome', e.target.value)}
            >
              <option value="">Select ABET Outcome</option>
              {abetOutcomes.map((outcome) => (
                <option key={outcome.id} value={outcome.id}>
                  {outcome.description}
                </option>
              ))}
            </select>

            <select
              value={row.score}
              onChange={(e) => handleSelectChange(index, 'score', parseInt(e.target.value))}
            >
              <option value={1}>Does Not Meet</option>
              <option value={2}>Approaching</option>
              <option value={3}>Meets</option>
              <option value={4}>Exceeds</option>
            </select>

            <select
              value={row.evidence_type}
              onChange={(e) => handleSelectChange(index, 'evidence_type', e.target.value)}
            >
              <option value="direct">Direct</option>
              <option value="indirect">Indirect</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addAbetRow}>+ Add ABET Outcome</button>
        <br /><br />
        <button type="submit" className="btn primary">Submit Learning Outcome</button>
      </form>
    </div>
  );
};

export default CreateLearningOutcome;
