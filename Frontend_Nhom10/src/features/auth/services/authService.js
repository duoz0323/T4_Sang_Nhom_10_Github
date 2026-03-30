import { authAPI } from '../../../services/api';

// Save auth data to localStorage
const saveAuthData = (data) => {
  // Handle both snake_case and camelCase from backend
  const accessToken = data.accessToken || data.access_token;
  const tokenType = data.tokenType || data.token_type || 'Bearer';
  const expiresIn = data.expiresIn || data.expires_in;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('tokenType', tokenType);
  localStorage.setItem('expiresIn', expiresIn);
  
  // Calculate expiration time
  const expiresAt = new Date().getTime() + (parseInt(expiresIn) * 1000);
  localStorage.setItem('expiresAt', expiresAt);
};

// Clear auth data
const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
};

// Check if token is expired
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expiresAt');
  if (!expiresAt) return true;
  return new Date().getTime() > parseInt(expiresAt);
};

// Get current user
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const authService = {
  // Login Candidate
  loginCandidate: async (email, password) => {
    try {
      const response = await authAPI.loginCandidate({ email, password });
      
      if (response.data.code === 1000) {
        const authData = response.data.result;
        saveAuthData(authData);
        localStorage.setItem('userType', 'candidate');
        
        return {
          success: true,
          data: authData,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại',
      };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Email hoặc mật khẩu không đúng';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Register Candidate
  registerCandidate: async (data) => {
    try {
      const response = await authAPI.registerCandidate(data);
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng ký thất bại',
      };
    } catch (error) {
      console.error('Register error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Email đã tồn tại hoặc thông tin không hợp lệ';
      return {
        success: false,
        message: errorMessage,
      };
    }
  },

  // Login Company
  loginCompany: async (email, password) => {
    try {
      const response = await authAPI.loginCompany({ email, password });
      
      if (response.data.code === 1000) {
        const authData = response.data.result;
        saveAuthData(authData);
        localStorage.setItem('userType', 'company');
        
        return {
          success: true,
          data: authData,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email hoặc mật khẩu không đúng',
      };
    }
  },

  // Register Company
  registerCompany: async (data) => {
    try {
      const response = await authAPI.registerCompany(data);
      
      if (response.data.code === 1000) {
        return {
          success: true,
          data: response.data.result,
        };
      }
      
      return {
        success: false,
        message: response.data.message || 'Đăng ký thất bại',
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Email đã tồn tại hoặc thông tin không hợp lệ',
      };
    }
  },

  // Logout
  logout: () => {
    clearAuthData();
  },

  // Check authentication
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return token && !isTokenExpired();
  },

  // Get user type
  getUserType: () => {
    return localStorage.getItem('userType');
  },

  // Get current user
  getCurrentUser,

  // Check token expiration
  isTokenExpired,
};

export default authService;
