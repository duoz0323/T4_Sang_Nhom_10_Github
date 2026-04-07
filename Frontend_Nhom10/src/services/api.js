import axios from 'axios';

// URL cơ sở API từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Thêm token vào các yêu cầu
api.interceptors.request.use(
  (config) => {
    const url = config.url || '';
    
    const publicEndpoints = [
      '/candidate_profile/login',
      '/candidate_profile/register',
      '/company_profile/login',
      '/company_profile/register',
      '/posts/public',
      '/posts/',
      '/candidate_profile/profiles',
      '/company_profile/profiles'
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => url.includes(endpoint));
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem('accessToken') || 
                    localStorage.getItem('token') || 
                    sessionStorage.getItem('temp_guest_token') ||
                    sessionStorage.getItem('temp_company_token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const authEndpoints = [
      '/candidate_profile/login',
      '/candidate_profile/register',
      '/company_profile/login',
      '/company_profile/register'
    ];
    
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      error.config?.url?.includes(endpoint)
    );
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.error(`❌ 401 Unauthorized on ${error.config?.url}`);
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// API Xác thực
export const authAPI = {
  // Đăng nhập ứng viên
  loginCandidate: (credentials) => {
    return api.post('/candidate_profile/login', credentials);
  },

  // Đăng ký ứng viên
  registerCandidate: (data) => {
    return api.post('/candidate_profile/register', data);
  },

  // Đăng nhập công ty
  loginCompany: (credentials) => {
    return api.post('/company_profile/login', credentials);
  },

  // Đăng ký công ty
  registerCompany: (data) => {
    return api.post('/company_profile/register', data);
  },
};

// API Hồ sơ
export const profileAPI = {
  // Lấy hồ sơ ứng viên
  getMyCandidateProfile: () => {
    return api.get('/candidate_profile/my-profile');
  },

  // Lấy hồ sơ công ty
  getMyCompanyProfile: () => {
    return api.get('/company_profile/my-profile');
  },

  // Cập nhật hồ sơ ứng viên
  updateCandidateProfile: (data) => {
    return api.put('/candidate_profile', data);
  },

  // Cập nhật hồ sơ công ty
  updateCompanyProfile: (data) => {
    return api.put('/company_profile', data);
  },

  // Đổi mật khẩu (ứng viên)
  changeCandidatePassword: (profileId, passwordData) => {
    return api.put(`/candidate_profile/${profileId}/change-password`, passwordData);
  },

  // Đổi mật khẩu (công ty)
  changeCompanyPassword: (profileId, passwordData) => {
    return api.put(`/company_profile/${profileId}/change-password`, passwordData);
  },

  // Tải ảnh đại diện (ứng viên)
  uploadCandidateAvatar: async (profileId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const uploadResponse = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const newAvatarUrl = uploadResponse.data;

    const currentProfileResponse = await api.get('/candidate_profile/my-profile');
    const cp = currentProfileResponse.data.result;

    const updateRequest = {
      fullName: cp.fullName || '',
      phoneNumber: cp.phoneNumber || '',
      address: cp.address || '',
      description: cp.description || '',
      currentJobTitle: cp.currentJobTitle || '',
      status: cp.status || true,
      birthday: cp.birthday || null,
      avatar: newAvatarUrl
    };

    return api.put('/candidate_profile', updateRequest);
  },

  // Tải ảnh đại diện (công ty)
  uploadCompanyAvatar: (profileId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/company_profile/${profileId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Tải CV (ứng viên)
  uploadCV: (data, file) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);
    return api.post(`/profile-cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Lấy danh sách CV (ứng viên)
  getMyCVs: () => {
    return api.get(`/profile-cv/my-profileCV`);
  },

  // Xóa CV (ứng viên)
  deleteCV: (cvId) => {
    return api.delete(`/profile-cv/${cvId}`);
  },

  // Xóa tài khoản (ứng viên)
  deleteCandidateAccount: (profileId) => {
    return api.delete(`/candidate_profile/${profileId}`);
  },

  // Xóa tài khoản (công ty)
  deleteCompanyAccount: (profileId) => {
    return api.delete(`/company_profile/${profileId}`);
  },
};

// API Công việc
export const jobAPI = {
  // Lấy tất cả công việc hoạt động (công khai) với bộ lọc
  getAllActiveJobs: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.locationId) queryParams.append('locationId', params.locationId);
    if (params.industryId) queryParams.append('industryId', params.industryId);
    if (params.minSalary) queryParams.append('minSalary', params.minSalary);
    if (params.maxSalary) queryParams.append('maxSalary', params.maxSalary);
    if (params.workingFormat) queryParams.append('workingFormat', params.workingFormat);
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    const queryString = queryParams.toString();
    return api.get(`/posts/public${queryString ? `?${queryString}` : ''}`);
  },

  // Lấy công việc theo ID
  getJobById: (id) => {
    return api.get(`/posts/${id}`);
  },

  // Lấy công việc của tôi (chỉ công ty)
  getMyJobs: () => {
    return api.get('/posts/my-jobs');
  },

  // Tạo công việc (chỉ công ty)
  createJob: (data) => {
    return api.post('/posts', data);
  },

  // Cập nhật công việc (chỉ công ty)
  updateJob: (id, data) => {
    return api.put(`/posts/${id}`, data);
  },

  // Đóng công việc
  closeJob: (id) => {
    return api.put(`/posts/${id}/close`);
  },

  // Mở lại công việc
  reopenJob: (id) => {
    return api.put(`/posts/${id}/reopen`);
  },

  // Nộp đơn xin việc (chỉ ứng viên)
  applyJob: (jobPostingId, applicationData, cvFile) => {
    const formData = new FormData();

    const data = {
      jobPostingId,
      name: applicationData.name ||  applicationData.fullName,
      email: applicationData.email,
      phone: applicationData.phone
    };
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));

    if (cvFile) {
      formData.append('file', cvFile);
    }

    return api.post('/applications/public', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Lấy các ứng dụng của tôi (chỉ ứng viên)
  getMyApplications: () => {
    return api.get('/applications/me');
  },

  saveJob: (postId) => {
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (!saved.includes(postId)) {
        saved.push(postId);
        localStorage.setItem('savedJobs', JSON.stringify(saved));
      }
      return Promise.resolve({ data: { code: 1000, result: null } });
    },

    unsaveJob: (postId) => {
      let saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      saved = saved.filter(id => id !== postId);
      localStorage.setItem('savedJobs', JSON.stringify(saved));
      return Promise.resolve({ data: { code: 1000, result: null } });
    },

    getSavedJobs: async () => {
      const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      if (savedIds.length === 0) {
        return Promise.resolve({ data: { code: 1000, result: [] } });
      }
      
      const jobs = [];
      for (const id of savedIds) {
        try {
           const response = await api.get(`/posts/${id}`);
           if (response.data?.result) jobs.push(response.data.result);
        } catch(e) {
           console.warn('Không thể tải công việc đã lưu', id);
        }
      }
      return Promise.resolve({ data: { code: 1000, result: jobs } });
    },

    checkIfSaved: (postId) => {
      const savedIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      return Promise.resolve({ data: { code: 1000, result: savedIds.includes(postId) } });
    },

  // API Quản trị
  // Lấy công việc chờ phê duyệt (chỉ quản trị viên)
  getPendingJobs: () => {
    return api.get('/posts/admin/pending');
  },

  // Cập nhật trạng thái công việc (chỉ quản trị viên) - chấp phê/từ chối
  updateJobStatus: (id, status) => {
    return api.patch(`/posts/admin/${id}/status`, {}, { params: { status } });
  },
};

// API Thông báo
export const notificationAPI = {
  // Lấy thông báo
  getNotifications: (lastId = null) => {
    const url = lastId ? `/notifications?lastId=${lastId}` : '/notifications';
    return api.get(url);
  },

  // Lấy số đếm chưa đọc
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Đánh dấu là đã đọc
  markAsRead: (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  // Xóa thông báo
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

// API Vị trí
export const locationAPI = {
  getAll: () => api.get('/locations'),
  search: (keyword) => api.get(`/locations/search?keyword=${keyword}`),
};

// API Ngành
export const industryAPI = {
  getAll: () => api.get('/industries'),
};

// API Kỹ năng
export const skillAPI = {
  getAll: () => api.get('/skills'),
  search: (keyword) => api.get(`/skills/search?keyword=${keyword}`),
};

// API Công ty
export const companyAPI = {
  // Lấy tất cả công ty
  getAllCompanies: () => {
    return api.get('/company_profile/profiles');
  },

  // Lấy thông tin công ty theo ID
  getCompanyById: (companyId) => {
    return api.get(`/company_profile/${companyId}`);
  },

  // Lấy công ty của tôi (chỉ công ty)
  getMyCompanyProfile: () => {
    return api.get('/company_profile/my-profile');
  },

  // Cập nhật thông tin công ty
  updateCompanyProfile: (companyId, data) => {
    return api.put(`/company_profile/${companyId}`, data);
  },

  // Upload logo công ty
  uploadCompanyLogo: (companyId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/company_profile/${companyId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
