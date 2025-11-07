import axios from 'axios';

const API_URL = 'http://localhost:8001/api/';
axios.defaults.withCredentials = true;

function getCSRFToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

const assessmentService = {
  // Get all assessments
  getAssessments: async () => {
    try {
      const response = await axios.get(`${API_URL}assessments/`);
      return response;
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  },

  // Get a single assessment by ID
  getAssessment: async (id) => {
    try {
      const response = await axios.get(`${API_URL}assessments/${id}/`);
      return response;
    } catch (error) {
      console.error(`Error fetching assessment ${id}:`, error);
      throw error;
    }
  },

  // Create a new assessment
  createAssessment: async (assessmentData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Token ${localStorage.getItem(`token`)}`,
        }
      };
  
      const response = await axios.post(`${API_URL}assessments/`, assessmentData, config);
      return response;
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  },
  // Get continuous improvements for an assessment
  getContinuousImprovements: async (assessmentId) => {
    try {
      const response = await axios.get(`${API_URL}continuous-improvements/?assessment_id=${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching continuous improvements:', error);
      throw error;
    }
  },

  // Get academic performances for an assessment
  getAcademicPerformances: async (assessmentId) => {
    try {
      const response = await axios.get(`${API_URL}academic-performances/?assessment_id=${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching academic performances:', error);
      throw error;
    }
  },

  // Get learning outcomes for an assessment
  getLearningOutcomes: async (assessmentId) => {
    try {
      const response = await axios.get(`${API_URL}learning-outcomes/?assessment_id=${assessmentId}`);
      return response;
    } catch (error) {
      console.error('Error fetching learning outcomes:', error);
      throw error;
    }
  },

  // Calculate assessment score
  calculateAssessmentScore: async (assessmentId) => {
    try {
      const response = await axios.get(`${API_URL}assessments/${assessmentId}/calculate-score/`);
      return response;
    } catch (error) {
      console.error('Error calculating assessment score:', error);
      throw error;
    }
  },

  deleteAssessment: async (assessmentId) => {
    const csrfToken = getCSRFToken();
    const config = {
      headers: {
        'X-CSRFToken': csrfToken,
      },
      withCredentials: true,
    };
  
    try {
      const response = await axios.delete(`${API_URL}assessments/${assessmentId}/`, config);
      return response;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  },
};

export default assessmentService;
