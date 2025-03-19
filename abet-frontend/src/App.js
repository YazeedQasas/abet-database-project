// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProgramsList from './pages/programs/ProgramsList';
import ProgramDetail from './pages/programs/ProgramDetail';
import AssessmentsList from './pages/assessment/AssessmentsList';
import AssessmentDetail from './pages/assessment/AssessmentDetail';
import ProgramForm from './pages/programs/ProgramForm';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/programs" element={<ProgramsList />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />
          <Route path="/assessments" element={<AssessmentsList />} />
          <Route path="/assessments/:id" element={<AssessmentDetail />} />
          <Route path="/programs/new" element={<ProgramForm />} />

          
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
