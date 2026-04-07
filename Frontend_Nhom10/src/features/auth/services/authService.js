import { authAPI, profileAPI } from '../../../services/api';

// Decode JWT token để lấy thông tin user và role
const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // JWT format: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Decode base64url
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    console.log('🔓 Decoded token:', decoded);
    
    // Lấy role từ token
    // Ưu tiên: realm_access.roles > roles (top-level)
    let roles = [];
    if (decoded.realm_access?.roles) {
      roles = decoded.realm_access.roles;
    } else if (decoded.roles) {
      roles = Array.isArray(decoded.roles) ? decoded.roles : [decoded.roles];
    }
    
    return {
      email: decoded.email || decoded.preferred_username,
      roles: roles,
      userId: decoded.sub,
      exp: decoded.exp
    };
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
};

// Lưu dữ liệu xác thực vào localStorage
const saveAuthData = (data) => {
  console.log('💾 saveAuthData called with:', data);
  
  // Xử lý cả snake_case và camelCase từ backend
  const accessToken = data.accessToken || data.access_token;
  const tokenType = data.tokenType || data.token_type || 'Bearer';
  const expiresIn = data.expiresIn || data.expires_in;

  console.log('🔑 Extracted token:', accessToken);
  console.log('🔑 Token type:', tokenType);
  console.log('⏰ Expires in:', expiresIn);

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('token', accessToken); // Cũng lưu dưới dạng 'token' để tương thích
  localStorage.setItem('tokenType', tokenType);
  localStorage.setItem('expiresIn', expiresIn);

  // Tính toán thời gian hết hạn
  const expiresAt = new Date().getTime() + (parseInt(expiresIn) * 1000);
  localStorage.setItem('expiresAt', expiresAt);
  
  console.log('✅ Token saved to localStorage:', {
    accessToken: localStorage.getItem('accessToken'),
    token: localStorage.getItem('token')
  });
};

// Xóa dữ liệu xác thực
const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('expiresIn');
  localStorage.removeItem('expiresAt');
  localStorage.removeItem('user');
  localStorage.removeItem('userType');
};

// Kiểm tra xem token đã hết hạn chưa
const isTokenExpired = () => {
  const expiresAt = localStorage.getItem('expiresAt');
  if (!expiresAt) return true;
  return new Date().getTime() > parseInt(expiresAt);
};

// Lấy người dùng hiện tại
const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const authService = {
  // Đăng nhập ứng viên
  loginCandidate: async (email, password) => {
    console.log('🔐 authService.loginCandidate called');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', '***' + password.substring(password.length - 3));
    
    try {
      console.log('📡 Calling authAPI.loginCandidate...');
      console.log('📡 Request payload:', { email, password: '***' });
      
      const response = await authAPI.loginCandidate({ email, password });
      
      console.log('📡 Raw response:', response);
      console.log('📡 Response data:', response.data);
      console.log('📡 Response code:', response.data?.code);

      if (response.data.code === 1000) {
        console.log('✅ Login API returned code 1000 (SUCCESS)');
        const authData = response.data.result;
        console.log('🔑 Auth data:', authData);
        
        saveAuthData(authData);
        
        // Decode token để lấy role thực tế
        const token = authData.accessToken || authData.access_token;
        const tokenData = decodeToken(token);
        console.log('🎭 Token data:', tokenData);
        
        // Xác định role từ token
        let userRole = 'APPLICANT'; // Default
        let userType = 'candidate';
        
        if (tokenData?.roles) {
          if (tokenData.roles.includes('ADMIN')) {
            userRole = 'ADMIN';
            userType = 'admin';
          } else if (tokenData.roles.includes('COMPANY')) {
            userRole = 'COMPANY';
            userType = 'company';
          } else if (tokenData.roles.includes('CANDIDATE')) {
            userRole = 'APPLICANT';
            userType = 'candidate';
          }
        }
        
        console.log('🎭 Detected role:', userRole);
        localStorage.setItem('userType', userType);

        // Lấy hồ sơ người dùng (nếu là candidate)
        if (userRole === 'APPLICANT') {
          try {
            console.log('👤 Fetching candidate profile...');
            const profileResponse = await profileAPI.getMyCandidateProfile();
            console.log('👤 Candidate profile response:', profileResponse.data);

            if (profileResponse.data.code === 1000) {
              const userProfile = profileResponse.data.result;
              // Định dạng dữ liệu người dùng cho AuthContext
              const userData = {
                id: userProfile.candidateProfileId,
                name: userProfile.fullName || userProfile.email?.split('@')[0] || 'User',
                email: userProfile.email,
                avatar: userProfile.avatar || null,
                role: userRole,
                ...userProfile
              };
              console.log('👤 Saving candidate user data:', userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (profileError) {
            console.error('⚠️ Failed to fetch profile:', profileError);
            // Tiếp tục với dữ liệu người dùng cơ bản
            const basicUserData = {
              id: tokenData?.userId || email,
              name: email.split('@')[0],
              email: email,
              avatar: null,
              role: userRole
            };
            console.log('👤 Using basic user data:', basicUserData);
            localStorage.setItem('user', JSON.stringify(basicUserData));
          }
        } else {
          // Admin hoặc role khác - lưu basic data
          const basicUserData = {
            id: tokenData?.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: userRole
          };
          console.log('👤 Saving admin/other user data:', basicUserData);
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
        return {
          success: true,
          data: authData,
        };
      }
      
      console.log('❌ Login API returned non-1000 code:', response.data.code);
      return {
        success: false,
        message: response.data.message || 'Đăng nhập thất bại',
      };
    } catch (error) {
      console.error('❌ Login error caught:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      console.error('❌ Error response headers:', error.response?.headers);
      
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

  // Đăng ký ứng viên
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

  // Đăng nhập công ty
  loginCompany: async (email, password) => {
    try {
      const response = await authAPI.loginCompany({ email, password });
      
      if (response.data.code === 1000) {
        const authData = response.data.result;
        saveAuthData(authData);
        
        // Decode token để lấy role thực tế
        const token = authData.accessToken || authData.access_token;
        const tokenData = decodeToken(token);
        console.log('🎭 Token data:', tokenData);
        
        // Xác định role từ token
        let userRole = 'COMPANY'; // Default cho company login
        let userType = 'company';
        
        if (tokenData?.roles) {
          if (tokenData.roles.includes('ADMIN')) {
            userRole = 'ADMIN';
            userType = 'admin';
          } else if (tokenData.roles.includes('COMPANY')) {
            userRole = 'COMPANY';
            userType = 'company';
          }
        }
        
        console.log('🎭 Detected role:', userRole);
        localStorage.setItem('userType', userType);

        // Lấy hồ sơ công ty (nếu là company)
        if (userRole === 'COMPANY') {
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
                role: userRole,
                ...companyProfile
              };
              console.log('🏢 Saving company user data:', userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (profileError) {
            console.error('Failed to fetch company profile:', profileError);
            const basicUserData = {
              id: tokenData?.userId || email,
              name: email.split('@')[0],
              email: email,
              avatar: null,
              role: userRole
            };
            localStorage.setItem('user', JSON.stringify(basicUserData));
          }
        } else {
          // Admin - lưu basic data
          const basicUserData = {
            id: tokenData?.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: userRole
          };
          console.log('👤 Saving admin user data:', basicUserData);
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

  // Đăng ký công ty
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

  // Đăng nhập admin (wrapper - admin có thể login qua candidate hoặc company endpoint)
  loginAdmin: async (email, password) => {
    console.log('🔐 authService.loginAdmin called');
    // Admin login qua candidate endpoint
    // Backend sẽ tự động gán role ADMIN nếu user có role đó trong Keycloak
    return authService.loginCandidate(email, password);
  },

  // Đăng xuất
  logout: () => {
    clearAuthData();
  },

  // Kiểm tra xác thực
  isAuthenticated: () => {
    const token = localStorage.getItem('accessToken');
    return token && !isTokenExpired();
  },

  // Lấy loại người dùng
  getUserType: () => {
    return localStorage.getItem('userType');
  },

  // Lấy người dùng hiện tại
  getCurrentUser,

  // Kiểm tra hết hạn token
  isTokenExpired,
};

export default authService;
