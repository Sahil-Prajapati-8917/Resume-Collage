import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import ResumeUpload from './pages/ResumeUpload'
import HiringForm from './pages/HiringForm'
import EvaluationResults from './pages/EvaluationResults'
import PromptManagement from './pages/PromptManagement'
import AuditTrail from './pages/AuditTrail'
import History from './pages/History'
import Profile from './pages/Profile'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<ResumeUpload />} />
          <Route path="/hiring-form" element={<HiringForm />} />
          <Route path="/results" element={<EvaluationResults />} />
          <Route path="/prompts" element={<PromptManagement />} />
          <Route path="/audit" element={<AuditTrail />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
