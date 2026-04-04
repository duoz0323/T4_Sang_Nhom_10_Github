import axios from 'axios';

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Candidate Login
  loginCandidate: (credentials) => {
    return api.post('/candidate_profile/login', credentials);
  },

  // Candidate Register
  registerCandidate: (data) => {
    return api.post('/candidate_profile/register', data);
  },

  // Company Login
  loginCompany: (credentials) => {
    return api.post('/company_profile/login', credentials);
  },

  // Company Register
  registerCompany: (data) => {
    return api.post('/company_profile/register', data);
  },
};

// Profile API
export const profileAPI = {
  // Get Candidate Profile
  getMyCandidateProfile: () => {
    return api.get('/candidate_profile/my-profile');
  },

  // Get Company Profile
  getMyCompanyProfile: () => {
    return api.get('/company_profile/my-profile');
  },

  // Update Candidate Profile
  updateCandidateProfile: (profileId, data) => {
    return api.put(`/candidate_profile/${profileId}`, data);
  },

  // Update Company Profile
  updateCompanyProfile: (profileId, data) => {
    return api.put(`/company_profile/${profileId}`, data);
  },

  // Change Password (Candidate)
  changeCandidatePassword: (profileId, passwordData) => {
    return api.put(`/candidate_profile/${profileId}/change-password`, passwordData);
  },

  // Change Password (Company)
  changeCompanyPassword: (profileId, passwordData) => {
    return api.put(`/company_profile/${profileId}/change-password`, passwordData);
  },

  // Upload Avatar (Candidate)
  uploadCandidateAvatar: (profileId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/candidate_profile/${profileId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload Avatar (Company)
  uploadCompanyAvatar: (profileId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/company_profile/${profileId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload CV (Candidate)
  uploadCV: (profileId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.put(`/candidate_profile/${profileId}/cv`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete Account (Candidate)
  deleteCandidateAccount: (profileId) => {
    return api.delete(`/candidate_profile/${profileId}`);
  },

  // Delete Account (Company)
  deleteCompanyAccount: (profileId) => {
    return api.delete(`/company_profile/${profileId}`);
  },
};

// Job API
export const jobAPI = {
  // Get all active jobs (public) with filters
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

  // Get job by ID
  getJobById: (id) => {
    return api.get(`/posts/${id}`);
  },

  // Get my jobs (company only)
  getMyJobs: () => {
    return api.get('/posts/my-jobs');
  },

  // Create job (company only)
  createJob: (data) => {
    return api.post('/posts', data);
  },

  // Update job (company only)
  updateJob: (id, data) => {
    return api.put(`/posts/${id}`, data);
  },

  // Close job
  closeJob: (id) => {
    return api.put(`/posts/${id}/close`);
  },

  // Reopen job
  reopenJob: (id) => {
    return api.put(`/posts/${id}/reopen`);
  },

  // Apply to job (candidate only)
  applyJob: (jobPostingId, applicationData, cvFile) => {
    const formData = new FormData();
    
    // Part 1: data (JSON as Blob)
    const data = {
      jobPostingId,  // ✅ Đúng field name theo Backend
      name: applicationData.name ||  applicationData.fullName,
      email: applicationData.email,
      phone: applicationData.phone
    };
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    
    // Part 2: file (binary)
    if (cvFile) {
      formData.append('file', cvFile);
    }
    
    return api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Get my applications (candidate only)
  getMyApplications: () => {
    return api.get('/applications/me');  // ✅ Đúng endpoint theo Backend Swagger
  },

  // ⚠️ SAVED JOBS - Backend chưa có endpoints này
  // TODO: Backend cần implement saved-jobs feature
  // Tạm thời disable để không gây lỗi 404
  
  saveJob: (postId) => {
    console.warn('⚠️ Saved jobs feature not implemented in backend');
    return Promise.resolve({ data: { code: 1000, result: null } });
  },

  unsaveJob: (postId) => {
    console.warn('⚠️ Saved jobs feature not implemented in backend');
    return Promise.resolve({ data: { code: 1000, result: null } });
  },

  getSavedJobs: () => {
    console.warn('⚠️ Saved jobs feature not implemented in backend');
    return Promise.resolve({ data: { code: 1000, result: [] } });
  },

  checkIfSaved: (postId) => {
    console.warn('⚠️ Saved jobs feature not implemented in backend');
    return Promise.resolve({ data: { code: 1000, result: false } });
  },
};

// Notification API
export const notificationAPI = {
  // Get notifications
  getNotifications: (lastId = null) => {
    const url = lastId ? `/notifications?lastId=${lastId}` : '/notifications';
    return api.get(url);
  },

  // Get unread count
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Mark as read
  markAsRead: (id) => {
    return api.patch(`/notifications/${id}/read`);
  },

  // Delete notification
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },
};

// Location API
export const locationAPI = {
  getAll: () => api.get('/locations'),
  search: (keyword) => api.get(`/locations/search?keyword=${keyword}`),
};

// Industry API
export const industryAPI = {
  getAll: () => api.get('/industries'),
};

// Skill API
export const skillAPI = {
  getAll: () => api.get('/skills'),
  search: (keyword) => api.get(`/skills/search?keyword=${keyword}`),
};

export default api;
