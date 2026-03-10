import { Toaster } from "sonner";
import { BrowserRouter, Routes, Route } from "react-router";
import UsersManagementPage from "./pages/admin/UsersManamentPage.jsx";
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
          <Route path="/users" element={<UsersManagementPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
