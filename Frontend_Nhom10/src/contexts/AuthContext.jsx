import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra xem người dùng đã đăng nhập từ localStorage chưa
    const storedUser = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');
    
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      
      // Force role based on userType (ensure consistency)
      if (userType === 'admin') {
        userData.role = 'ADMIN';
      } else if (userType === 'candidate') {
        userData.role = 'APPLICANT';
      } else if (userType === 'company') {
        userData.role = 'COMPANY';
      }
      
      console.log('🔄 AuthContext: Loading user from localStorage', userData);
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // userData nên bao gồm: { id, name, email, avatar, role: 'APPLICANT' | 'COMPANY' | 'ADMIN' }
    console.log('✅ AuthContext: Login', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('👋 AuthContext: Logout');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.clear();
  };

  // Helper: Get home path based on role
  const getHomePath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    return '/'; // APPLICANT goes to home
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    isApplicant: user?.role === 'APPLICANT',
    isCompany: user?.role === 'COMPANY',
    isAdmin: user?.role === 'ADMIN',
    userRole: user?.role, // Add explicit userRole
    getHomePath // Export helper
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
