import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MasterAdminLayout from './components/MasterAdminLayout'
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

        {/* Master Admin routes */}
        <Route path="/master-admin/dashboard" element={
          <MasterAdminLayout>
            <MasterAdminDashboard />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/companies" element={
          <MasterAdminLayout>
            <CompanyManagement />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/hr-users" element={
          <MasterAdminLayout>
            <HRUserManagement />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/global-hiring-forms" element={
          <MasterAdminLayout>
            <GlobalHiringForms />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/prompt-management" element={
          <MasterAdminLayout>
            <PromptManagement />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/evaluation-oversight" element={
          <MasterAdminLayout>
            <EvaluationOversight />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/audit-trail" element={
          <MasterAdminLayout>
            <AuditTrail />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/analytics" element={
          <MasterAdminLayout>
            <SystemAnalytics />
          </MasterAdminLayout>
        } />
        <Route path="/master-admin/settings" element={
          <MasterAdminLayout>
            <SystemSettings />
          </MasterAdminLayout>
        } />

        {/* 404 catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
