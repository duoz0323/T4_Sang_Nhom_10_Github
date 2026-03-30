import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import LoginPage from "./features/auth/pages/LoginPage.jsx";
import RegisterPage from "./features/auth/pages/RegisterPage.jsx";
import DashboardPage from "./features/auth/pages/DashboardPage.jsx";
import UsersManagementPage from "./features/admin/pages/UsersManagementPage.jsx";
import HomePage from "./features/home/pages/HomePage.jsx";
import './App.css'

function App() {
  return (
    <>
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersManagementPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
