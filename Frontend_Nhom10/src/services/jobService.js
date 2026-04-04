import { jobAPI } from './api';

/**
 * Job Service - Quản lý tin tuyển dụng
 */
const jobService = {
  /**
   * Lấy danh sách tin tuyển dụng công khai (ACTIVE)
   * @returns {Promise<Array>} Danh sách job postings
   */
  getPublicJobs: async () => {
    try {
      const response = await jobAPI.getAllActiveJobs();
      return response.data?.result || [];
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một tin tuyển dụng
   * @param {string} jobId - ID của job posting
   * @returns {Promise<Object>} Chi tiết job
   */
  getJobDetail: async (jobId) => {
    try {
      const response = await jobAPI.getJobById(jobId);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error fetching job detail:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách job của công ty (Company only)
   * @returns {Promise<Array>} Danh sách job của company
   */
  getMyJobs: async () => {
    try {
      const response = await jobAPI.getMyJobs();
      return response.data?.result || [];
    } catch (error) {
      console.error('Error fetching my jobs:', error);
      throw error;
    }
  },

  /**
   * Tạo tin tuyển dụng mới (Company only)
   * @param {Object} jobData - Dữ liệu job posting
   * @returns {Promise<Object>} Job vừa tạo
   */
  createJob: async (jobData) => {
    try {
      const response = await jobAPI.createJob(jobData);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  /**
   * Cập nhật tin tuyển dụng (Company only)
   * @param {string} jobId - ID của job
   * @param {Object} jobData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Job đã cập nhật
   */
  updateJob: async (jobId, jobData) => {
    try {
      const response = await jobAPI.updateJob(jobId, jobData);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  /**
   * Đóng tin tuyển dụng (Company only)
   * @param {string} jobId - ID của job
   * @returns {Promise<Object>} Job đã đóng
   */
  closeJob: async (jobId) => {
    try {
      const response = await jobAPI.closeJob(jobId);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error closing job:', error);
      throw error;
    }
  },

  /**
   * Mở lại tin tuyển dụng (Company only)
   * @param {string} jobId - ID của job
   * @returns {Promise<Object>} Job đã mở lại
   */
  reopenJob: async (jobId) => {
    try {
      const response = await jobAPI.reopenJob(jobId);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error reopening job:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tin chờ duyệt (Admin only)
   * @returns {Promise<Array>} Danh sách job PENDING
   */
  getPendingJobs: async () => {
    try {
      const response = await jobAPI.getPendingJobs();
      return response.data?.result || [];
    } catch (error) {
      console.error('Error fetching pending jobs:', error);
      throw error;
    }
  },

  /**
   * Admin duyệt/từ chối tin (Admin only)
   * @param {string} jobId - ID của job
   * @param {string} status - 'ACTIVE' hoặc 'REJECTED'
   * @returns {Promise<Object>} Job đã cập nhật
   */
  updateJobStatus: async (jobId, status) => {
    try {
      const response = await jobAPI.updateJobStatus(jobId, status);
      return response.data?.result || null;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },

  /**
   * Format salary để hiển thị
   * @param {number} salary - Mức lương
   * @returns {string} Formatted salary
   */
  formatSalary: (salary) => {
    if (!salary) return 'Thỏa thuận';
    
    // Convert to millions (triệu)
    const millions = salary / 1000000;
    
    if (millions >= 1) {
      return `${millions.toFixed(0)} triệu VNĐ`;
    }
    
    return `${(salary / 1000).toFixed(0)}k VNĐ`;
  },

  /**
   * Filter jobs theo keyword, location, industry
   * @param {Array} jobs - Danh sách jobs
   * @param {Object} filters - Bộ lọc { keyword, location, industry, salaryRange }
   * @returns {Array} Jobs đã filter
   */
  filterJobs: (jobs, filters = {}) => {
    let filteredJobs = [...jobs];

    // Filter by keyword (title hoặc description)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title?.toLowerCase().includes(keyword) ||
          job.description?.toLowerCase().includes(keyword)
      );
    }

    // Filter by location
    if (filters.location) {
      filteredJobs = filteredJobs.filter((job) =>
        job.locations?.some(
          (loc) => loc.city?.toLowerCase() === filters.location.toLowerCase()
        )
      );
    }

    // Filter by industry
    if (filters.industry) {
      filteredJobs = filteredJobs.filter((job) =>
        job.industries?.some(
          (ind) =>
            ind.nameIndustry?.toLowerCase() === filters.industry.toLowerCase()
        )
      );
    }

    // Filter by salary range
    if (filters.salaryRange) {
      const [min, max] = filters.salaryRange;
      filteredJobs = filteredJobs.filter(
        (job) => job.salaryRequire >= min && job.salaryRequire <= max
      );
    }

    return filteredJobs;
  },
};

export default jobService;
