import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, locationAPI, industryAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { ensureAuthenticated } from '../../../services/guestAuth';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

// Mock data for public job list (when not logged in)
const MOCK_JOBS_LIST = [
  {
    jobPostingId: 1,
    title: 'Senior Frontend Developer',
    companyName: 'Công ty ABC',
    salaryMin: 25000000,
    salaryMax: 35000000,
    location: 'Hồ Chí Minh',
    type: 'Full-time',
    tags: ['React', 'TypeScript', 'Node.js'],
    logo: 'https://via.placeholder.com/64'
  },
  {
    jobPostingId: 2,
    title: 'Backend Java Developer',
    companyName: 'Công ty XYZ',
    salaryMin: 20000000,
    salaryMax: 30000000,
    location: 'Hà Nội',
    type: 'Full-time',
    tags: ['Java', 'Spring Boot', 'MySQL'],
    logo: 'https://via.placeholder.com/64'
  },
  {
    jobPostingId: 3,
    title: 'Marketing Manager',
    companyName: 'Công ty DEF',
    salaryMin: 18000000,
    salaryMax: 25000000,
    location: 'Đà Nẵng',
    type: 'Full-time',
    tags: ['Marketing', 'SEO', 'Content'],
    logo: 'https://via.placeholder.com/64'
  },
  {
    jobPostingId: 4,
    title: 'Product Manager',
    companyName: 'Công ty GHI',
    salaryMin: 30000000,
    salaryMax: 45000000,
    location: 'Hồ Chí Minh',
    type: 'Full-time',
    tags: ['Product Management', 'Agile', 'Scrum'],
    logo: 'https://via.placeholder.com/64'
  },
  {
    jobPostingId: 5,
    title: 'DevOps Engineer',
    companyName: 'Công ty JKL',
    salaryMin: 25000000,
    salaryMax: 40000000,
    location: 'Hà Nội',
    type: 'Full-time',
    tags: ['Docker', 'Kubernetes', 'AWS'],
    logo: 'https://via.placeholder.com/64'
  },
  {
    jobPostingId: 6,
    title: 'UX/UI Designer',
    companyName: 'Công ty MNO',
    salaryMin: 15000000,
    salaryMax: 25000000,
    location: 'Đà Nẵng',
    type: 'Full-time',
    tags: ['Figma', 'Adobe XD', 'Sketch'],
    logo: 'https://via.placeholder.com/64'
  },
];

const JobListPage = () => {
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    locationId: '',
    industryId: '',
    minSalary: '',
    maxSalary: '',
    workingFormat: ''
  });
  const jobsPerPage = 5;

  useEffect(() => {
    console.log('🔵 JobListPage mounted');
    fetchLocations();
    fetchIndustries();
    fetchJobs();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedJobs();
    }
  }, [isAuthenticated]);

  const fetchLocations = async () => {
    try {
      await ensureAuthenticated(); // Ensure token
      const response = await locationAPI.getAll();
      if (response?.data?.code === 1000 && response?.data?.result) {
        setLocations(response.data.result);
        console.log('✅ Loaded locations from API:', response.data.result.length);
      }
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
    }
  };

  const fetchIndustries = async () => {
    try {
      await ensureAuthenticated(); // Ensure token
      const response = await industryAPI.getAll();
      if (response?.data?.code === 1000 && response?.data?.result) {
        setIndustries(response.data.result);
        console.log('✅ Loaded industries from API:', response.data.result.length);
      }
    } catch (err) {
      console.error('❌ Error fetching industries:', err);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await jobAPI.getSavedJobs();
      if (response?.data?.result) {
        const savedIds = new Set(response.data.result.map(job => job.jobPostingId));
        setSavedJobs(savedIds);
      }
    } catch (err) {
      console.error('❌ Error fetching saved jobs:', err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    console.log('🔵 Fetching jobs with filters:', filters);
    
    try {
      await ensureAuthenticated(); // Ensure token
      console.log('🔄 Attempting to fetch from API...');
      const response = await jobAPI.getAllActiveJobs(filters);
      console.log('📊 API response:', response.data);
      
      if (response?.data?.code === 1000 && response?.data?.result) {
        const jobsFromAPI = response.data.result;
        console.log('✅ Got', jobsFromAPI.length, 'jobs from API');
        
        const mappedJobs = jobsFromAPI.map(job => ({
          jobPostingId: job.jobPostingId,
          title: job.title,
          companyName: job.companyProfile?.companyName || 'Company',
          salaryMin: job.salaryRequire || 0,
          salaryMax: job.salaryRequire ? job.salaryRequire * 1.5 : 0, // Estimate max as 1.5x
          location: job.locations?.map(l => l.city).join(', ') || 'Chưa xác định',
          type: 'Full-time', // Default as backend doesn't have workingFormat in response
          tags: job.skills?.slice(0, 3).map(s => s.skillName) || [],
          logo: job.companyProfile?.avatar || 'https://via.placeholder.com/64'
        }));
        
        setJobs(mappedJobs);
      } else {
        console.warn('⚠️ No jobs returned or invalid response');
        setJobs([]);
      }
    } catch (err) {
      console.error('❌ API error:', err.response?.data || err.message);
      console.error('❌ Full error:', err);
      setJobs([]); // Set empty array instead of mock data
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
    setCurrentPage(1);
    fetchJobs();
  };

  // Pagination logic
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

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
      console.error('❌ Error toggling save job:', err);
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
          {/* Simplified Sidebar Filter */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-slate-100 sticky top-24 shadow-sm"
              style={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
              {/* Search */}
              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tìm kiếm</h3>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all" 
                    placeholder="Từ khóa..." 
                    type="text"
                    value={filters.keyword}
                    onChange={(e) => handleFilterChange('keyword', e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-8 mb-8">
                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Địa điểm</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/20" 
                        type="checkbox"
                        checked={filters.locationId === 'hcm'}
                        onChange={(e) => handleFilterChange('locationId', e.target.checked ? 'hcm' : '')}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">TP. Hồ Chí Minh</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/20" 
                        type="checkbox"
                        checked={filters.locationId === 'hanoi'}
                        onChange={(e) => handleFilterChange('locationId', e.target.checked ? 'hanoi' : '')}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">Hà Nội</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/20" 
                        type="checkbox"
                        checked={filters.locationId === 'danang'}
                        onChange={(e) => handleFilterChange('locationId', e.target.checked ? 'danang' : '')}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">Đà Nẵng</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 rounded border-slate-300 text-secondary focus:ring-secondary/20" 
                        type="checkbox"
                        checked={filters.workingFormat === 'Remote'}
                        onChange={(e) => handleFilterChange('workingFormat', e.target.checked ? 'Remote' : '')}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">Remote</span>
                    </label>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Mức lương</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 border-slate-300 text-secondary focus:ring-secondary/20" 
                        name="salary" 
                        type="radio"
                        checked={filters.minSalary === '10000000' && filters.maxSalary === '20000000'}
                        onChange={() => {
                          handleFilterChange('minSalary', '10000000');
                          handleFilterChange('maxSalary', '20000000');
                        }}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">10tr - 20tr</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 border-slate-300 text-secondary focus:ring-secondary/20" 
                        name="salary" 
                        type="radio"
                        checked={filters.minSalary === '20000000' && filters.maxSalary === '40000000'}
                        onChange={() => {
                          handleFilterChange('minSalary', '20000000');
                          handleFilterChange('maxSalary', '40000000');
                        }}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">20tr - 40tr</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        className="w-5 h-5 border-slate-300 text-secondary focus:ring-secondary/20" 
                        name="salary" 
                        type="radio"
                        checked={filters.minSalary === '40000000'}
                        onChange={() => {
                          handleFilterChange('minSalary', '40000000');
                          handleFilterChange('maxSalary', '');
                        }}
                      />
                      <span className="text-slate-600 group-hover:text-primary transition-colors font-medium">Trên 40tr</span>
                    </label>
                  </div>
                </section>
              </div>

              <button 
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all shadow-sm"
                onClick={applyFilters}
                disabled={loading}
              >
                {loading ? 'Đang tải...' : 'Lọc kết quả'}
              </button>
            </div>
          </aside>

          {/* Simplified Job List */}
          <div className="flex-1 space-y-8">
            {/* Stats */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <p className="text-slate-400 text-sm">Tìm thấy <span className="text-primary font-bold">{jobs.length}</span> cơ hội nghề nghiệp</p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sắp xếp :</span>
                <select className="bg-transparent border-none focus:ring-0 text-primary font-bold text-sm cursor-pointer p-0">
                  <option>Mới nhất</option>
                  <option>Lương cao nhất</option>
                </select>
              </div>
            </div>

            {/* Job Cards with more whitespace */}
            <div className="grid grid-cols-1 gap-8">
              {/* DEBUG INFO */}
              {console.log('🔵 JobListPage render - Jobs count:', jobs.length, 'Jobs:', jobs)}
              
              {/* Dynamic Job Cards - Paginated */}
              {currentJobs.map((job, index) => (
                <div key={job.jobPostingId} className="job-card bg-white p-6 rounded-xl border border-slate-100 relative group hover:shadow-xl hover:border-secondary/30 transition-all duration-300 ease-in-out cursor-pointer">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100 p-2">
                      <img 
                        className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700" 
                        alt={`${job.companyName} logo`}
                        src={job.logo}
                      />
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
                          <span className="text-primary font-semibold">${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
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
                        <div className="flex gap-2">
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
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center pt-12">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;
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
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default JobListPage;
