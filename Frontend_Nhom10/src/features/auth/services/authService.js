import { authAPI, profileAPI } from '../../../services/api';

// Save auth data to localStorage
const saveAuthData = (data) => {
  // Handle both snake_case and camelCase from backend
  const accessToken = data.accessToken || data.access_token;
  const tokenType = data.tokenType || data.token_type || 'Bearer';
  const expiresIn = data.expiresIn || data.expires_in;
  
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('token', accessToken); // Also save as 'token' for compatibility
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
        
        // Fetch user profile
        try {
          const profileResponse = await profileAPI.getMyCandidateProfile();
          console.log('👤 Candidate profile response:', profileResponse.data);
          
          if (profileResponse.data.code === 1000) {
            const userProfile = profileResponse.data.result;
            // Format user data for AuthContext
            const userData = {
              id: userProfile.candidateProfileId,
              name: userProfile.fullName || userProfile.email?.split('@')[0] || 'User',
              email: userProfile.email,
              avatar: userProfile.avatar || null,
              role: 'APPLICANT', // Force APPLICANT role
              ...userProfile
            };
            console.log('👤 Saving candidate user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
          // Continue with basic user data
          const basicUserData = {
            id: authData.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: 'APPLICANT'
          };
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
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
        
        // Fetch company profile
        try {
          const profileResponse = await profileAPI.getMyCompanyProfile();
          console.log('🏢 Company profile response:', profileResponse.data);
          
          if (profileResponse.data.code === 1000) {
            const companyProfile = profileResponse.data.result;
            const userData = {
              id: companyProfile.companyProfileId,
              name: companyProfile.companyName || companyProfile.email?.split('@')[0] || 'Company',
              email: companyProfile.email,
              avatar: companyProfile.logo || null,
              role: 'COMPANY', // Force COMPANY role
              ...companyProfile
            };
            console.log('🏢 Saving company user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } catch (profileError) {
          console.error('Failed to fetch company profile:', profileError);
          const basicUserData = {
            id: authData.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: 'COMPANY'
          };
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
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
