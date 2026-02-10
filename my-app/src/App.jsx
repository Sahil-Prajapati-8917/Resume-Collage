import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import MasterAdminLayout from './components/MasterAdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
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
import MasterAdminDashboard from './pages/MasterAdminDashboard'
import CompanyManagement from './pages/CompanyManagement'
import HRUserManagement from './pages/HRUserManagement'
import GlobalHiringForms from './pages/GlobalHiringForms'
import EvaluationOversight from './pages/EvaluationOversight'
import SystemAnalytics from './pages/SystemAnalytics'
import SystemSettings from './pages/SystemSettings'
import FairnessDashboard from './pages/FairnessDashboard'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<ProtectedCreateAccount />} />

        {/* Protected main app routes with layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout>
              <ResumeUpload />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/hiring-form" element={
          <ProtectedRoute>
            <Layout>
              <HiringForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <Layout>
              <EvaluationResults />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/prompts" element={
          <ProtectedRoute>
            <Layout>
              <PromptManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <Layout>
              <AuditTrail />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Protected Master Admin routes */}
        <Route path="/master-admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <MasterAdminDashboard />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/fairness" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <FairnessDashboard />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/companies" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <CompanyManagement />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/hr-users" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <HRUserManagement />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/global-hiring-forms" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <GlobalHiringForms />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/prompt-management" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <PromptManagement />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/evaluation-oversight" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <EvaluationOversight />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/audit-trail" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <AuditTrail />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/analytics" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <SystemAnalytics />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/master-admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <MasterAdminLayout>
              <SystemSettings />
            </MasterAdminLayout>
          </ProtectedRoute>
        } />

        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
