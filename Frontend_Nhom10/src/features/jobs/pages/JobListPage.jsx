import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { jobAPI, locationAPI, industryAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';import { MOCK_LOCATIONS, MOCK_INDUSTRIES } from '../../../constants';import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const JobListPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // newest, salary-high, salary-low
  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    locationId: searchParams.get('locationId') || '',
    industryId: searchParams.get('industryId') || '',
    minSalary: searchParams.get('minSalary') || '',
    maxSalary: searchParams.get('maxSalary') || '',
    workingFormat: searchParams.get('workingFormat') || ''
  });
  const jobsPerPage = 10;

  //  PARALLEL FETCHING - Load locations, industries, and jobs simultaneously
  useEffect(() => {
    const initializeData = async () => {
      // Kiểm tra cache trước
      const cachedLocations = sessionStorage.getItem('locations');
      const cachedIndustries = sessionStorage.getItem('industries');
      
      // Prepare promises for parallel execution
      const promises = [];
      
      // Chỉ gọi API nếu chưa được lưu trong cache
      if (!cachedLocations) {
        promises.push(
          locationAPI.search('')
            .then(response => {
              if (response?.data?.code === 1000 && response?.data?.result) {
                setLocations(response.data.result);
                sessionStorage.setItem('locations', JSON.stringify(response.data.result));
                } else {
                  setLocations(MOCK_LOCATIONS);
                }
              })
              .catch(err => {
                console.warn('Cannot fetch locations (need login):', err.response?.status);
                setLocations(MOCK_LOCATIONS);
              })
          );
        } else {
          setLocations(JSON.parse(cachedLocations));
        }

        if (!cachedIndustries) {
          promises.push(
            industryAPI.getAll()
              .then(response => {
                if (response?.data?.code === 1000 && response?.data?.result) {
                  setIndustries(response.data.result);
                  sessionStorage.setItem('industries', JSON.stringify(response.data.result));
                } else {
                   setIndustries(MOCK_INDUSTRIES);
                }
              })
              .catch(err => {
                console.warn('Cannot fetch industries (need login):', err.response?.status);
                setIndustries(MOCK_INDUSTRIES);
              })
          );
        } else {
          setIndustries(JSON.parse(cachedIndustries));
        }

      promises.push(fetchJobs());
      
      // Khởi chạy tất cả cùng lúc (parallel)
      await Promise.all(promises);
    };
    
    initializeData();
  }, []);

  useEffect(() => {
    // Only fetch jobs when page changes (not on initial load)
    if (currentPage !== 0) {
      fetchJobs();
    }
  }, [currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs();
    }
  }, [isAuthenticated]);

  async function fetchSavedJobs() {
    try {
      const response = await jobAPI.getSavedJobs();
      if (response?.data?.result) {
        const savedIds = new Set(response.data.result.map(job => job.jobPostingId));
        setSavedJobs(savedIds);
      }
    } catch (err) {
      // Saved jobs not implemented in backend yet
      console.warn('Saved jobs not available');
    }
  };

  async function fetchJobs() {
    setLoading(true);

    try {
      const params = {
        ...filters,
        page: currentPage,
        size: jobsPerPage
      };

      const response = await jobAPI.getAllActiveJobs(params);

      if (response?.data?.code === 1000 && response?.data?.result) {
        //  SIMPLIFIED PARSING - Backend always returns Array for /posts/public
        const jobsFromAPI = response.data.result;

        if (Array.isArray(jobsFromAPI)) {
            const mappedJobs = jobsFromAPI.map(job => {
              // Convert small numbers (like 30) to millions if needed, or leave raw
              let min = job.salaryRequire || 0;
              let max = job.salaryRequire ? job.salaryRequire * 1.5 : 0;
              
              if (min > 0 && min < 1000) {
                // Assuming it's already in millions context (e.g. 30 = 30 million)
                min = min * 1000000;
                max = max * 1000000;
              } else if (min >= 1000 && min < 1000000) {
                // Assuming it's in thousands context (e.g. 30000 = 30 million)
                min = min * 1000;
                max = max * 1000;
              }

              return {
                jobPostingId: job.jobPostingId,
                title: job.title,
                companyName: job.companyProfile?.companyName || 'Company',
                salaryMin: min,
                salaryMax: max,
                location: job.locations?.map(l => l.name || l.city || l.province).filter(Boolean).join(', ') || 'Chưa xác định',
                type: job.workingFormat || 'Full-time',
                tags: job.skills?.slice(0, 3).map(s => s.name || s.skillName).filter(Boolean) || [],
                logo: job.companyProfile?.avatar || 'https://via.placeholder.com/64',
                deadline: job.deadline,
                industry: job.industry?.name
              };
            });

          //  FRONTEND PAGINATION - Backend returns all jobs, we paginate client-side
          const startIndex = currentPage * jobsPerPage;
          const endIndex = startIndex + jobsPerPage;
          const paginatedJobs = mappedJobs.slice(startIndex, endIndex);

          setJobs(paginatedJobs);
          setTotalElements(mappedJobs.length);
          setTotalPages(Math.ceil(mappedJobs.length / jobsPerPage));
          
          // Cache all jobs for faster pagination
          sessionStorage.setItem('allJobs', JSON.stringify(mappedJobs));
        } else {
          console.warn('Unexpected response format (not an array):', jobsFromAPI);
          setJobs([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } else {
        setJobs([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('API error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setJobs([]);
      setTotalPages(0);
      setTotalElements(0);
    }

    setLoading(false);
   
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(0);
    fetchJobs();
  };
  
  const handleSort = (sortType) => {
    setSortBy(sortType);
    const sorted = [...jobs].sort((a, b) => {
      switch (sortType) {
        case 'salary-high':
          return b.salaryMin - a.salaryMin;
        case 'salary-low':
          return a.salaryMin - b.salaryMin;
        case 'newest':
        default:
          return 0; // Keep original order from API
      }
    });
    setJobs(sorted);
  };
  
  const clearFilters = () => {
    setFilters({
      keyword: '',
      locationId: '',
      industryId: '',
      minSalary: '',
      maxSalary: '',
      workingFormat: ''
    });
    setSortBy('newest');
    setCurrentPage(0);
    fetchJobs();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để lưu công việc');
      return;
    }

    try {
      if (savedJobs.has(jobId)) {
        await jobAPI.unsaveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await jobAPI.saveJob(jobId);
        setSavedJobs(prev => {
          const newSet = new Set(prev);
          newSet.add(jobId);
          return newSet;
        });
      }
    } catch (err) {
      console.error('Error toggling save job:', err);
      alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-surface-container-low flex-1">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <header className="mt-8 mb-10">
            <div className="max-w-3xl">
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-secondary mb-4 block">Executive Search</span>
              <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-6">Danh sách việc làm</h1>
              <p className="text-slate-500 text-lg leading-relaxed">Tìm kiếm các vị trí quản lý và điều hành cấp cao hàng đầu tại Việt Nam và Khu vực.</p>
            </div>
          </header>

          <div className="flex flex-col lg:flex-row gap-10">
          {/* Bộ lọc tìm kiếm */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-outline-variant sticky top-24 shadow-sm"
              style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              {/* Header */}
              <h2 className="text-lg font-bold text-primary mb-6">Bộ lọc tìm kiếm</h2>


              {/* Ngành nghề dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-2">Ngành nghề</label>
                <select
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={filters.industryId}
                  onChange={(e) => handleFilterChange('industryId', e.target.value)}
                >
                  <option value="">Tất cả ngành nghề</option>
                  {industries.map(industry => (
                    <option key={industry.industryId} value={industry.industryId}>
                      {industry.nameIndustry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Địa điểm dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-2">Địa điểm</label>
                <select
                  className="w-full px-4 py-2.5 bg-surface-container border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={filters.locationId}
                  onChange={(e) => handleFilterChange('locationId', e.target.value)}
                >
                  <option value="">Tất cả địa điểm</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kinh nghiệm checkboxes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-3">Kinh nghiệm</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.experienceLevel === 'under1'}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.checked ? 'under1' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Dưới 1 năm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.experienceLevel === '1-3'}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.checked ? '1-3' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">1 - 3 năm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.experienceLevel === '3-5'}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.checked ? '3-5' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">3 - 5 năm</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.experienceLevel === 'above5'}
                      onChange={(e) => handleFilterChange('experienceLevel', e.target.checked ? 'above5' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Trên 5 năm</span>
                  </label>
                </div>
              </div>

              {/* Loại hình checkboxes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-3">Loại hình</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.workingFormat === 'Full-time'}
                      onChange={(e) => handleFilterChange('workingFormat', e.target.checked ? 'Full-time' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Toàn thời gian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.workingFormat === 'Part-time'}
                      onChange={(e) => handleFilterChange('workingFormat', e.target.checked ? 'Part-time' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Bán thời gian</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.workingFormat === 'Contract'}
                      onChange={(e) => handleFilterChange('workingFormat', e.target.checked ? 'Contract' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Hợp đồng</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20"
                      checked={filters.workingFormat === 'Internship'}
                      onChange={(e) => handleFilterChange('workingFormat', e.target.checked ? 'Internship' : '')}
                    />
                    <span className="text-sm text-on-surface group-hover:text-primary transition-colors">Thực tập</span>
                  </label>
                </div>
              </div>

              {/* Mức lương (triệu VND) với slider */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-on-surface mb-3">Mức lương (triệu VND)</label>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="75000000"
                    step="5000000"
                    value={filters.maxSalary || 75000000}
                    onChange={(e) => {
                      const val = e.target.value;
                      handleFilterChange('minSalary', '15000000');
                      handleFilterChange('maxSalary', val);
                    }}
                    className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                    <span> 0 </span>
                    <span>{Math.round((filters.maxSalary || 75000000) / 1000000)} triệu</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <button
                  onClick={applyFilters}
                  className="w-full py-3 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm"
                >
                  Lọc
                </button>
                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-surface-container text-on-surface border border-outline-variant rounded-lg font-medium hover:bg-surface-container-high transition-all"
                >
                  Xóa lọc
                </button>
              </div>
            </div>
          </aside>

          {/* Danh sách công việc được đơn giản hóa */}
          <div className="flex-1 space-y-8">
            {/* Thống kê */}
              <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <p className="text-slate-400 text-sm">
                Tìm thấy <span className="text-primary font-bold">{totalElements || jobs.length}</span> cơ hội nghề nghiệp
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sắp xếp :</span>
                <select 
                  className="bg-transparent border-none focus:ring-0 text-primary font-bold text-sm cursor-pointer p-0 hover:text-secondary transition-colors"
                  value={sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="salary-high">Lương cao nhất</option>
                  <option value="salary-low">Lương thấp nhất</option>
                </select>
              </div>
            </div>

            {/* Thẻ công việc với khoảng trắng nhiều hơn */}
            <div className="grid grid-cols-1 gap-8">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <LoadingSpinner text="Đang tải danh sách việc làm..." />
                </div>
              ) : jobs.length === 0 ? (
  // Trạng thái trống
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">Không tìm thấy công việc phù hợp</h3>
                  <p className="text-slate-500 mb-6">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-secondary transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                // Thẻ hiển thị công việc
                jobs.map((job) => (
                  <div key={job.jobPostingId} className="job-card bg-white p-6 rounded-xl border border-slate-100 relative group hover:shadow-xl hover:border-secondary/30 transition-all duration-300 ease-in-out cursor-pointer">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                      {/* Company Avatar với fallback đẹp */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-linear-to-br from-primary to-secondary border border-outline-variant flex items-center justify-center">
                        {job.logo ? (
                          <img
                            className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700 bg-white p-2"
                            alt={`${job.companyName} logo`}
                            src={job.logo}
                            onError={(e) => {
                              // Fallback to company initials
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white ${job.logo ? 'hidden' : 'flex'}`}
                        >
                          {job.companyName?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-2xl font-extrabold text-primary leading-tight">{job.title}</h2>
                          <button
                            onClick={() => toggleSaveJob(job.jobPostingId)}
                            className={`transition-all duration-200 ${
                              savedJobs.has(job.jobPostingId)
                                ? 'text-secondary scale-110'
                                : 'text-slate-300 hover:text-secondary'
                            }`}
                          >
                            <span
                              className="material-symbols-outlined text-3xl"
                              style={{
                                fontVariationSettings: savedJobs.has(job.jobPostingId) ? "'FILL' 1" : "'FILL' 0"
                              }}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                        <p className="text-secondary font-bold text-base mb-6 uppercase tracking-wide">{job.companyName}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mức lương</span>
                            <span className="text-primary font-semibold">
                              {job.salaryMin > 0 && job.salaryMax > 0
                                ? `${(job.salaryMin / 1000000).toFixed(0)} - ${(job.salaryMax / 1000000).toFixed(0)} triệu` 
                                : job.salary || 'Thỏa thuận'
                              }
                            </span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Địa điểm</span>
                            <span className="text-primary font-semibold">{job.location}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hình thức</span>
                            <span className="text-primary font-semibold">{job.type}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 flex-wrap">
                            {job.tags.map((tag, i) => (
                              <span key={i} className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[11px] font-bold border border-slate-100 uppercase tracking-tighter">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Link to={`/jobs/${job.jobPostingId}`} className="group/btn inline-flex items-center gap-2 text-primary font-black text-sm hover:text-secondary transition-colors">
                            XEM CHI TIẾT
                            <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">arrow_right_alt</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Phân trang */}
            <div className="flex justify-center pt-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-slate-200 text-primary hover:bg-slate-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-primary hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Chân trang */}
      <Footer />
    </div>
  );
};

export default JobListPage;


