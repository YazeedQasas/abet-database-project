import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getPrograms, getCoursesByProgram } from '../../services/programService';
import './AssessmentForm.css';
import assessmentService from '../../services/assessmentService';

const AssessmentForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    date: '',
  });

  const [programs, setPrograms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all programs on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await getPrograms();
        setPrograms(response.data);
      } catch (err) {
        console.error('Error fetching programs:', err);
        setError('Failed to load programs.');
      }
    };

    fetchPrograms();
  }, []);

  // Fetch courses when program is selected
  const handleProgramChange = async (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    setSelectedCourse('');
    setCourses([]);

    if (programId) {
      try {
        const response = await getCoursesByProgram(programId);
        setCourses(response.data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses.');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        course: selectedCourse, // Assuming your serializer accepts "course"
      };

      await assessmentService.createAssessment(payload);
      navigate('/assessments');
    } catch (err) {
      console.error('Error creating assessment:', err.response?.data || err.message);
      setError('Failed to create assessment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assessment-form-container">
      <h2>Create New Assessment</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Assessment Name</label>
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
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="program">Program</label>
          <select
            id="program"
            name="program"
            value={selectedProgram}
            onChange={handleProgramChange}
            required
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="course">Course</label>
          <select
            id="course"
            name="course"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            disabled={!selectedProgram}
            required
          >
            <option value="">Select Course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Assessment'}
        </button>
      </form>
    </div>
  );
};

export default AssessmentForm;
