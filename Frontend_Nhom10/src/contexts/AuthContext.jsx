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
    const storedUser = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (storedUser) {
      const userData = JSON.parse(storedUser);

      if (userType === 'admin') {
        userData.role = 'ADMIN';
      } else if (userType === 'candidate') {
        userData.role = 'APPLICANT';
      } else if (userType === 'company') {
        userData.role = 'COMPANY';
      }

      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userType = localStorage.getItem('userType');
    if (!userData.role && userType) {
      if (userType === 'admin') userData.role = 'ADMIN';
      else if (userType === 'candidate') userData.role = 'APPLICANT';
      else if (userType === 'company') userData.role = 'COMPANY';
    }

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.clear();
  };

  const getHomePath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    return '/';
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
    userRole: user?.role,
    getHomePath
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
