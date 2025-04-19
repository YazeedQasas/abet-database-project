// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ProgramsList from './pages/programs/ProgramsList';
import ProgramDetail from './pages/programs/ProgramDetail';
import ProgramForm from './pages/programs/ProgramForm';
import AssessmentsList from './pages/assessment/AssessmentsList';
import AssessmentForm from './pages/assessment/AssessmentForm';
import AssessmentDetail from './pages/assessment/AssessmentDetail';
import DepartmentsList from './pages/departments/DepartmentsList';
import DepartmentForm from './pages/departments/DepartmentForm';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/auth/Unauthorized';
import PublicOnlyRoute  from './components/common/PublicOnlyRoute';
import CreateContinuousImprovement from './pages/assessment/CreateContinuousImprovement'; // adjust path if needed


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/programs" element={
            <ProtectedRoute>
              <Layout>
                <ProgramsList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/programs/new" element={
            <ProtectedRoute requiredRoles={['admin', 'faculty']}>
              <Layout>
                <ProgramForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/programs/:id" element={
            <ProtectedRoute>
              <Layout>
                <ProgramDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessments" element={
            <ProtectedRoute>
              <Layout>
                <AssessmentsList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessments/:id" element={
            <ProtectedRoute>
              <Layout>
                <AssessmentDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/departments" element={
            <ProtectedRoute>
              <Layout>
                <DepartmentsList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/departments/new" element={
            <ProtectedRoute requiredRoles={['admin']}>
              <Layout>
                <DepartmentForm />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/assessments" element={
            <ProtectedRoute>
              <Layout>
                <AssessmentsList />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessments/new" element={
            <ProtectedRoute requiredRoles={['admin', 'faculty']}>
              <Layout>
                <AssessmentForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/assessments/:id" element={
            <ProtectedRoute>
              <Layout>
                <AssessmentDetail />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/continuous-improvements/new" element={
            <Layout>
            <CreateContinuousImprovement />
            </Layout>} 
            />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
