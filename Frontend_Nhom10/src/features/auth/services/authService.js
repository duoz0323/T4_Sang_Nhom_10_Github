import { authAPI, profileAPI } from '../../../services/api';

// Hàm dịch lỗi tiếng Anh sang tiếng Việt dễ hiểu
const translateAuthError = (message) => {
  if (!message) return '';
  const msg = message.toString();
  const errorTranslations = {
    'Unauthenticated': 'Tài khoản hoặc mật khẩu không chính xác.',
    'User existed': 'Email này đã được đăng ký tài khoản.',
    'Company existed': 'Email hoặc hệ thống công ty này đã tồn tại.',
    'Uncategorized error': 'Tài khoản hoặc mật khẩu không chính xác.',
    'Password must be at least': 'Mật khẩu phải có ít nhất 6 ký tự.',
    'Cannot be left blank': 'Vui lòng điền đủ thông tin.',
    'NOT_BLANK': 'Trường thông tin không được để trống.',
    'Number must be none nagative': 'Dữ liệu số không hợp lệ.'
  };

  for (const [eng, vie] of Object.entries(errorTranslations)) {
    if (msg.includes(eng) || msg === eng) {
      return vie;
    }
  }
  return msg;
};

// Giải mã token JWT để lấy thông tin người dùng và quyền
const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // Định dạng JWT: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    // Giải mã base64url
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    console.log('Token đã giải mã:', decoded);
    
    // Lấy role từ token
    // Ưu tiên: realm_access.roles > roles (cấp cao nhất)
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
    console.error('Lỗi khi giải mã token:', error);
    return null;
  }
};

// Lưu dữ liệu xác thực vào localStorage
const saveAuthData = (data) => {
  console.log('Đã gọi saveAuthData với:', data);
  
  // Xử lý cả snake_case và camelCase từ backend
  const accessToken = data.accessToken || data.access_token;
  const refreshToken = data.refreshToken || data.refresh_token;                 
  const tokenType = data.tokenType || data.token_type || 'Bearer';
  const expiresIn = data.expiresIn || data.expires_in;

  console.log('Token đã trích xuất:', accessToken);
  console.log('Loại token:', tokenType);
  console.log('Hết hạn trong:', expiresIn);

  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('token', accessToken); // Cũng lưu dưới dạng 'token' để tương thích
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);         
  localStorage.setItem('tokenType', tokenType);
  localStorage.setItem('expiresIn', expiresIn);

  // Tính toán thời gian hết hạn
  const expiresAt = new Date().getTime() + (parseInt(expiresIn) * 1000);
  localStorage.setItem('expiresAt', expiresAt);
  
  console.log('Token đã lưu vào localStorage:', {
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
    console.log('Đã gọi authService.loginCandidate');
    console.log('Email:', email);
    console.log('Password:', '***'+ password.substring(password.length - 3));
    
    try {
      console.log('Đang gọi authAPI.loginCandidate...');
      console.log('Dữ liệu gửi đi:', { email, password: '***'});
      
      const response = await authAPI.loginCandidate({ email, password });
      
      console.log('Phản hồi gốc:', response);
      console.log('Dữ liệu phản hồi:', response.data);
      console.log('Mã phản hồi:', response.data?.code);

      if (response.data.code === 1000) {
        console.log('API đăng nhập trả về mã 1000 (THÀNH CÔNG)');
        const authData = response.data.result;
        console.log('Dữ liệu xác thực:', authData);
        
        saveAuthData(authData);
        
        // Decode token để lấy role thực tế
        const token = authData.accessToken || authData.access_token;
        const tokenData = decodeToken(token);
        console.log('Dữ liệu token:', tokenData);
        
        // Xác định role từ token
        let userRole = 'APPLICANT'; // Mặc định
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
        
        console.log('Quyền được phát hiện:', userRole);
        localStorage.setItem('userType', userType);

        // Lấy hồ sơ người dùng (nếu là candidate)
        if (userRole === 'APPLICANT') {
          try {
            console.log('Đang tải hồ sơ ứng viên...');
            const profileResponse = await profileAPI.getMyCandidateProfile();
            console.log('Phản hồi hồ sơ ứng viên:', profileResponse.data);

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
            console.log('Đang lưu dữ liệu ứng viên:', userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (profileError) {
            console.error('Không thể tải hồ sơ:', profileError);
            // Tiếp tục với dữ liệu người dùng cơ bản
            const basicUserData = {
              id: tokenData?.userId || email,
              name: email.split('@')[0],
              email: email,
              avatar: null,
              role: userRole
            };
            console.log('Đang sử dụng dữ liệu người dùng cơ bản:', basicUserData);
            localStorage.setItem('user', JSON.stringify(basicUserData));
          }
        } else {
          // Admin hoặc quyền khác - lưu dữ liệu cơ bản
          const basicUserData = {
            id: tokenData?.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: userRole
          };
          console.log('Đang lưu dữ liệu người dùng admin/khác:', basicUserData);
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
        return {
          success: true,
          data: authData,
        };
      }
      
      console.log('API đăng nhập trả về mã khác 1000:', response.data.code);
      return {
        success: false,
        message: translateAuthError(response.data.message || 'Đăng nhập thất bại'),
      };
    } catch (error) {
      console.error('Đã bắt được lỗi đăng nhập:', error);
      console.error('Thông báo lỗi:', error.message);
      console.error('Phản hồi lỗi:', error.response);
      console.error('Dữ liệu phản hồi lỗi:', error.response?.data);
      console.error('Trạng thái phản hồi lỗi:', error.response?.status);
      console.error('Tiêu đề phản hồi lỗi:', error.response?.headers);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Email hoặc mật khẩu không đúng';
      return {
        success: false,
        message: translateAuthError(errorMessage),
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
        message: translateAuthError(response.data.message || 'Đăng ký thất bại'),
      };
    } catch (error) {
      console.error('Lỗi đăng ký:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          error.message || 
                          'Email đã tồn tại hoặc thông tin không hợp lệ';
      return {
        success: false,
        message: translateAuthError(errorMessage),
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
        console.log('Dữ liệu token:', tokenData);
        
        // Xác định role từ token
        let userRole = 'COMPANY'; // Mặc định cho đăng nhập công ty
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
        
        console.log('Quyền được phát hiện:', userRole);
        localStorage.setItem('userType', userType);

        // Lấy hồ sơ công ty (nếu là company)
        if (userRole === 'COMPANY') {
          try {
            const profileResponse = await profileAPI.getMyCompanyProfile();
            console.log('Phản hồi hồ sơ công ty:', profileResponse.data);

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
            console.log('Đang lưu dữ liệu công ty:', userData);
              localStorage.setItem('user', JSON.stringify(userData));
            }
          } catch (profileError) {
            console.error('Không thể tải hồ sơ công ty:', profileError);
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
          // Admin - lưu dữ liệu cơ bản
          const basicUserData = {
            id: tokenData?.userId || email,
            name: email.split('@')[0],
            email: email,
            avatar: null,
            role: userRole
          };
          console.log('Đang lưu dữ liệu admin:', basicUserData);
          localStorage.setItem('user', JSON.stringify(basicUserData));
        }
        
        return {
          success: true,
          data: authData,
        };
      }
      
      return {
        success: false,
        message: translateAuthError(response.data.message || 'Đăng nhập thất bại'),
      };
    } catch (error) {
      return {
        success: false,
        message: translateAuthError(error.response?.data?.message || 'Email hoặc mật khẩu không đúng'),
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
        message: translateAuthError(response.data.message || 'Đăng ký thất bại'),
      };
    } catch (error) {
      return {
        success: false,
        message: translateAuthError(error.response?.data?.message || 'Email đã tồn tại hoặc thông tin không hợp lệ'),
      };
    }
  },

  // Đăng nhập admin (wrapper - admin có thể login qua candidate hoặc company endpoint)
  loginAdmin: async (email, password) => {
    console.log('Đã gọi authService.loginAdmin');
    // Đăng nhập admin qua endpoint của ứng viên
    // Backend sẽ tự động gán quyền ADMIN nếu người dùng có quyền đó trong Keycloak
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
