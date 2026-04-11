import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/common/ScrollToTop";
import ProtectedRoute from "./components/common/ProtectedRoute";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";
import HomePage from "./features/home/pages/HomePage.jsx";
import JobListPage from "./features/jobs/pages/JobListPage.jsx";
import JobDetailPage from "./features/jobs/pages/JobDetailPage.jsx";
import CompanyListPage from "./features/companies/pages/CompanyListPage.jsx";
import CompanyDetailPage from "./features/companies/pages/CompanyDetailPage.jsx";
import ProfilePage from "./features/profile/pages/ProfilePage.jsx";
import MyJobsPage from "./features/profile/pages/MyJobsPage.jsx";
import SettingsPage from "./features/settings/pages/SettingsPage.jsx";
import CompanyDashboard from "./features/company/pages/CompanyDashboard.jsx";
import CompanyProfilePage from "./features/company/pages/CompanyProfilePage.jsx";
import CompanySettingsPage from "./features/company/pages/CompanySettingsPage.jsx";
import CompanyManageJobsPage from "./features/company/pages/CompanyManageJobsPage.jsx";
import CompanyCreateJobPage from "./features/company/pages/CompanyCreateJobPage.jsx";
import CandidateProfilePage from "./features/candidates/pages/CandidateProfilePage.jsx";
import CompanyManageCandidatesPage from './features/company/pages/CompanyManageCandidatesPage';
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage.jsx";
import BlogPage from "./features/blog/pages/BlogPage.jsx";
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Toaster 
        richColors 
        position="top-right" 
        toastOptions={{
          style: {
            marginTop: '80px',
          },
        }}
      />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompanyListPage />} />
          <Route path="/companies/:id" element={<CompanyDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Candidate Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute requiredRole="APPLICANT">
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute requiredRole="APPLICANT">
                <MyJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/cv"
            element={
              <ProtectedRoute requiredRole="APPLICANT">
                <CandidateProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredRole="APPLICANT">
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Company Routes */}
          <Route
            path="/company/dashboard"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/manage-jobs"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyManageJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/create-job"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyCreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/edit-job/:id"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyCreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/candidates"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyManageCandidatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/profile"
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanyProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/company/settings" 
            element={
              <ProtectedRoute requiredRole="COMPANY">
                <CompanySettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App;



