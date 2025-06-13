// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Home from "./pages/Home";
import ProgramsList from "./pages/programs/ProgramsList";
import ProgramDetail from "./pages/programs/ProgramDetail";
import ProgramForm from "./pages/programs/ProgramForm";
import AssessmentsList from "./pages/assessment/AssessmentsList";
import AssessmentForm from "./pages/assessment/AssessmentForm";
import AssessmentDetail from "./pages/assessment/AssessmentDetail";
import DepartmentsList from "./pages/departments/DepartmentsList";
import DepartmentForm from "./pages/departments/DepartmentForm";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Unauthorized from "./pages/auth/Unauthorized";
import PublicOnlyRoute from "./components/common/PublicOnlyRoute";
import CreateContinuousImprovement from "./pages/assessment/CreateContinuousImprovement";
import AuditLog from "./components/AuditLog";
import ArchiveViewer from "./pages/ArchiveViewer";
import ReportsFeed from "./components/Reports/ReportsFeed";
import CreateReport from "./components/Reports/CreateReport";
import CourseForm from "./pages/courses/CourseForm";
import CourseList from "./pages/courses/CourseList";
import CreateAcademicPerformance from "./pages/assessment/CreateAcademicPerformance";
import CreateLearningOutcome from "./pages/assessment/CreateLearningOutcome";
import AddTraining from "./pages/FacultyTraining/AddTraining";
import FacultyTraining from "./pages/FacultyTraining/FacultyTraining";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route
            path="/Dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/AdminDashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Home />} />

          <Route
            path="/faculty-training"
            element={
              <ProtectedRoute>
                <Layout>
                  <FacultyTraining />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-training/add"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddTraining />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProgramsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs/new"
            element={
              <ProtectedRoute requiredRoles={["admin", "faculty"]}>
                <Layout>
                  <ProgramForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/programs/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProgramDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssessmentsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssessmentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <ProtectedRoute>
                <Layout>
                  <DepartmentsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/departments/new"
            element={
              <ProtectedRoute requiredRoles={["admin"]}>
                <Layout>
                  <DepartmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssessmentsList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments/new"
            element={
              <ProtectedRoute requiredRoles={["admin", "faculty"]}>
                <Layout>
                  <AssessmentForm />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assessments/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <AssessmentDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/continuous-improvements/new"
            element={
              <Layout>
                <CreateContinuousImprovement />
              </Layout>
            }
          />

          <Route
            path="/audit-logs"
            element={
              <Layout>
                <AuditLog />
              </Layout>
            }
          />

          <Route
            path="/archive"
            element={
              <Layout>
                <ArchiveViewer />
              </Layout>
            }
          />

          <Route
            path="/reports"
            element={
              <Layout>
                <ReportsFeed />
              </Layout>
            }
          />
          <Route
            path="/reports/new"
            element={
              <Layout>
                <CreateReport />
              </Layout>
            }
          />

          <Route
            path="/courses"
            element={
              <Layout>
                <CourseList />
              </Layout>
            }
          />
          <Route
            path="/courses/new"
            element={
              <Layout>
                <CourseForm />
              </Layout>
            }
          />
          <Route
            path="/assessments/:id/academic-performance/new"
            element={
              <Layout>
                <CreateAcademicPerformance />
              </Layout>
            }
          />
          <Route
            path="/learning-outcomes/new"
            element={
              <Layout>
                <CreateLearningOutcome />
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
