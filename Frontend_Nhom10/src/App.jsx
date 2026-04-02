import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "./components/common/ScrollToTop";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";
import UsersManagementPage from "./features/admin/pages/UsersManagementPage.jsx";
import HomePage from "./features/home/pages/HomePage.jsx";
import JobListPage from "./features/jobs/pages/JobListPage.jsx";
import JobDetailPage from "./features/jobs/pages/JobDetailPage.jsx";
import ProfilePage from "./features/profile/pages/ProfilePage.jsx";
import SettingsPage from "./features/settings/pages/SettingsPage.jsx";
import CompanyDashboard from "./features/company/pages/CompanyDashboard.jsx";
import CompanyProfilePage from "./features/company/pages/CompanyProfilePage.jsx";
import CompanySettingsPage from "./features/company/pages/CompanySettingsPage.jsx";
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
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/profile" element={<CompanyProfilePage />} />
          <Route path="/company/settings" element={<CompanySettingsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
