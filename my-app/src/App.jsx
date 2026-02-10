import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import MasterAdminLayout from './components/layout/MasterAdminLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/auth/Login'
import ProtectedCreateAccount from './pages/auth/ProtectedCreateAccount'
import NotFound from './pages/misc/NotFound'
import Dashboard from './pages/dashboard/Dashboard'
import ResumeUpload from './pages/evaluation/ResumeUpload'
import HiringForm from './pages/evaluation/HiringForm'
import EvaluationResults from './pages/evaluation/EvaluationResults'
import PromptManagement from './pages/admin/PromptManagement'
import AuditTrail from './pages/dashboard/AuditTrail'
import History from './pages/evaluation/History'
import Profile from './pages/user/Profile'
import MasterAdminDashboard from './pages/dashboard/MasterAdminDashboard'
import CompanyManagement from './pages/admin/CompanyManagement'
import HRUserManagement from './pages/admin/HRUserManagement'
import GlobalHiringForms from './pages/evaluation/GlobalHiringForms'
import EvaluationOversight from './pages/evaluation/EvaluationOversight'
import SystemAnalytics from './pages/dashboard/SystemAnalytics'
import SystemSettings from './pages/admin/SystemSettings'
import FairnessDashboard from './pages/admin/FairnessDashboard'
import JobView from './pages/public/JobView'
import JobApplications from './pages/dashboard/JobApplications'
import JobHistory from './pages/evaluation/JobHistory'
import Queue from './pages/evaluation/Queue'

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-account" element={<ProtectedCreateAccount />} />

        {/* Public Routes */}
        <Route path="/apply/:id" element={<JobView />} />

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
        <Route path="/queue" element={
          <ProtectedRoute>
            <Layout>
              <Queue />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/job-history" element={
          <ProtectedRoute>
            <Layout>
              <JobHistory />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/job-applications/:id" element={
          <ProtectedRoute>
            <Layout>
              <JobApplications />
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