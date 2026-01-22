import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import ProtectedCreateAccount from './pages/ProtectedCreateAccount'
import NotFound from './pages/NotFound'
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
      <Routes>
        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<ProtectedCreateAccount />} />

        {/* Main app routes with layout */}
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/upload" element={
          <Layout>
            <ResumeUpload />
          </Layout>
        } />
        <Route path="/hiring-form" element={
          <Layout>
            <HiringForm />
          </Layout>
        } />
        <Route path="/results" element={
          <Layout>
            <EvaluationResults />
          </Layout>
        } />
        <Route path="/prompts" element={
          <Layout>
            <PromptManagement />
          </Layout>
        } />
        <Route path="/audit" element={
          <Layout>
            <AuditTrail />
          </Layout>
        } />
        <Route path="/history" element={
          <Layout>
            <History />
          </Layout>
        } />
        <Route path="/profile" element={
          <Layout>
            <Profile />
          </Layout>
        } />

        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
