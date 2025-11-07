// src/services/dashboardAPI.js
import api from "./api";

export const dashboardAPI = {
  // Fixed URLs to match your Django router configuration
  getDashboardStats: () => api.get("/dashboard-stats/"), // ✅ Fixed

  // ABET Outcomes - using your actual router path
  getABETOutcomes: () => api.get("/abetoutcome/"), // ✅ Fixed

  // Course assessments - using your actual router path
  getCourseAssessments: (semester = null) => {
    const params = semester ? `?semester=${semester}` : "";
    return api.get(`/assessments/${params}`); // ✅ Fixed
  },

  // Audit logs - using your actual direct path
  getRecentActivities: () => api.get("/audit-logs/"), // ✅ Fixed

  // Recent Activities - Using the actual router path
  getRecentActivitiesForDashboard: () => api.get("/recent-activities/"),

  // Assessment events - using your actual router path
  getAssessmentEvents: () => api.get("/assessment-events/"), // ✅ Fixed

  // Learning outcomes - using your actual router path
  getLearningOutcomes: () => api.get("/learning-outcomes/"), // ✅ Fixed

  // Continuous improvements - using your actual router path
  getContinuousImprovements: () => api.get("/continuous-improvements/"), // ✅ Fixed

  // Academic performances - using your actual router path
  getAcademicPerformances: () => api.get("/academic-performances/"), // ✅ Fixed

  // Programs data - using your actual router paths
  getPrograms: () => api.get("/programs/"), // ✅ Fixed
  getCourses: () => api.get("/courses/"), // ✅ Fixed
  getDepartments: () => api.get("/departments/"), // ✅ Fixed

  // Assessment CRUD operations
  createAssessment: (data) => api.post("/assessments/", data),
  updateAssessment: (id, data) => api.put(`/assessments/${id}/`, data),
  deleteAssessment: (id) => api.delete(`/assessments/${id}/`),
  getAssessmentById: (id) => api.get(`/assessments/${id}/`),

  // Note: These endpoints don't exist in your views yet
  // You'll need to add them to your views.py or remove these calls
  getProgramAverages: () => api.get("/program-averages/"), // ⚠️ Need to add this endpoint
  getABETAccreditationStatus: () => api.get("/abet-accreditation-status/"), // ⚠️ Need to add this endpoint
};
