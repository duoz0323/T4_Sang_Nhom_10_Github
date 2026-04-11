import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI, locationAPI, industryAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { MOCK_LOCATIONS, MOCK_INDUSTRIES } from '../../../constants';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const MOCK_JOBS = [
  {
    jobPostingId: 1,
    title: 'Senior Frontend Developer',
    description: 'Công ty ABC - Hồ Chí Minh',
    salaryRequire: 30000000,
    status: 'ACTIVE',
    locations: [{ city: 'Hồ Chí Minh' }],
    industries: [{
      skills: [
        { skillName: 'React' },
        { skillName: 'TypeScript' },
        { skillName: 'Node.js' }
      ]
    }]
  },
  {
    jobPostingId: 2,
    title: 'Backend Java Developer',
    description: 'Công ty XYZ - Hà Nội',
    salaryRequire: 25000000,
    status: 'ACTIVE',
    locations: [{ city: 'Hà Nội' }],
    industries: [{
      skills: [
        { skillName: 'Java' },
        { skillName: 'Spring Boot' },
        { skillName: 'MySQL' }
      ]
    }]
  },
  {
    jobPostingId: 3,
    title: 'Marketing Manager',
    description: 'Công ty DEF - Đà Nẵng',
    salaryRequire: 20000000,
    status: 'ACTIVE',
    locations: [{ city: 'Đà Nẵng' }],
    industries: [{
      skills: [
        { skillName: 'Marketing' },
        { skillName: 'SEO' },
        { skillName: 'Content' }
      ]
    }]
  }
];

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false); // Changed to false
  const [error, setError] = useState(null);

  // Trạng thái tìm kiếm
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchIndustry, setSearchIndustry] = useState('');
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [filtersLoading, setFiltersLoading] = useState(false); // Changed to false

  // Lấy địa điểm và ngành nghề (từ cache trước)
  useEffect(() => {
    const fetchData = async () => {
      // Kiểm tra cache trước
      const cachedLocations = sessionStorage.getItem('locations');
      const cachedIndustries = sessionStorage.getItem('industries');
      
      if (cachedLocations && cachedIndustries) {
        // Load from cache immediately
        setLocations(JSON.parse(cachedLocations));
        setIndustries(JSON.parse(cachedIndustries));
        setFiltersLoading(false);
        return;
      }
      
      setFiltersLoading(true);
      try {
        const [locationsRes, industriesRes] = await Promise.all([
          locationAPI.search('').catch(() => ({ data: { code: 1000, result: MOCK_LOCATIONS } })),
          industryAPI.getAll().catch(() => ({ data: { code: 1000, result: MOCK_INDUSTRIES } }))
        ]);

        if (locationsRes?.data?.code === 1000 && locationsRes?.data?.result) {
          const locs = locationsRes.data.result;
          setLocations(locs);
          sessionStorage.setItem('locations', JSON.stringify(locs));
        }

        if (industriesRes?.data?.code === 1000 && industriesRes?.data?.result) {
          const inds = industriesRes.data.result;
          setIndustries(inds);
          sessionStorage.setItem('industries', JSON.stringify(inds));
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
        // Fallback to MOCK when error is thrown directly
        setLocations(MOCK_LOCATIONS);
        setIndustries(MOCK_INDUSTRIES);
      } finally {
        setFiltersLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    // Xây dựng các tham số truy vấn cho tìm kiếm công việc
    const params = new URLSearchParams();
    if (searchKeyword) params.append('keyword', searchKeyword);
    if (searchLocation) {
      const location = locations.find(loc => loc.city === searchLocation);
      if (location) params.append('locationId', location.id);
    }
    if (searchIndustry) {
      const industry = industries.find(ind => ind.nameIndustry === searchIndustry);
      if (industry) params.append('industryId', industry.industryId);
    }

    // Chuyển hướng đến trang công việc với bộ lọc
    navigate(`/jobs${params.toString() ? '?' + params.toString() : ''}`);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      // Ưu tiên kiểm tra cache (bộ nhớ tạm) để hiển thị ngay
      const cachedJobs = sessionStorage.getItem('homepage_top_jobs');
      if (cachedJobs) {
        setJobs(JSON.parse(cachedJobs));
      }
      
      setLoading(true);

      try {
        // Lấy thêm công việc để có top 3 mức lương cao nhất
        const response = await jobAPI.getAllActiveJobs({ page: 0, size: 20 });

        if (response?.data?.code === 1000 && response?.data?.result) {
          const jobsData = response.data.result;

          // Sắp xếp theo mức lương (cao nhất trước) và lấy top 3
          const sortedJobs = [...jobsData].sort((a, b) => {
            const salaryA = a.salaryRequire || 0;
            const salaryB = b.salaryRequire || 0;
            return salaryB - salaryA;
          });

          const topJobs = sortedJobs.slice(0, 3);
          setJobs(topJobs);
          sessionStorage.setItem('homepage_top_jobs', JSON.stringify(topJobs));
          setError(null);
        } else {
          setError('Không thể tải dữ liệu công việc');
          if (!cachedJobs) setJobs([]);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Có lỗi xảy ra khi tải dữ liệu');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getEmploymentTypeLabel = (status) => {
    // Sử dụng status từ job thay vì employmentType
    const labels = {
      'ACTIVE': 'Full-time',
      'PENDING': 'Pending',
      'CLOSED': 'Closed',
      'EXPIRED': 'Expired',
      'REJECTED': 'Rejected'
    };
    return labels[status] || 'Full-time';
  };

  const getEmploymentTypeBadgeClass = (status) => {
    const classes = {
      'ACTIVE': 'bg-secondary-container text-on-secondary-container',
      'PENDING': 'bg-tertiary-fixed text-on-tertiary-fixed',
      'CLOSED': 'bg-surface-container text-on-surface-variant',
      'EXPIRED': 'bg-surface-container text-on-surface-variant',
      'REJECTED': 'bg-surface-container text-on-surface-variant'
    };
    return classes[status] || 'bg-secondary-container text-on-secondary-container';
  };

  const formatSalary = (salaryRequire) => {
    if (!salaryRequire) return 'Thỏa thuận';
      
      let min = salaryRequire;
      if (min > 0 && min < 1000) {
        min = min * 1000000;
      } else if (min >= 1000 && min < 1000000) {
        min = min * 1000;
      }

      const max = min * 1.5;
      return `${(min / 1000000).toFixed(0)} - ${(max / 1000000).toFixed(0)} triệu`;
  };

  const getCompanyName = (job) => {
    // Backend có job.companyProfile.companyName
    return job?.companyProfile?.companyName || 'Company';
  };

  const getLocation = (locations) => {
    if (!locations || locations.length === 0) return 'Chưa xác định';
    return locations.map(loc => loc.city).join(', ');
  };

  const getSkills = (job) => {
    // Cấu trúc backend: job.skills (mảng SkillResponse)
    if (!job?.skills || job.skills.length === 0) return [];
    return job.skills.map(skill => skill.skillName);
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container selection:text-on-secondary-container flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      <main className="pt-16 flex-1">
        {/* Phần Hero */}
        <section className="relative min-h-167.5 flex items-center overflow-hidden bg-primary-container">
          <div className="absolute inset-0 opacity-40">
            <img className="w-full h-full object-cover" alt="Modern high-end office interior with glass walls and professional atmosphere at twilight with soft blue and teal lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwHEMTNrS-jAJNuHkwPB3MOICE6iPEc7qfmlm9SMkI8pHo6XLPvPSamT9k8IC6HC1x-IA7oRs_lja7poLVwWNFFBaIoRDHU-c7XjKilsJrvZ2wMD2zsUeB50otL5PTQCfPkxfeFw8qDm61Xk24fkwUq4L_WXJH6-tw-D8kBsN2O7fYlpzv9zqtx6_7ufOd30hTVmXK6p4lINX9NWyEIVupiGtW2giUq__SPslL7megVTAlV1tK4kxzvGslWBbW9JIOLJWYoHoOVq5s" />
            <div className="absolute inset-0 bg-linear-to-r from-primary-container via-primary-container/80 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary-fixed text-xs font-bold tracking-widest uppercase">
                <span className="material-symbols-outlined text-sm">verified</span>
                Nền tảng tuyển dụng Executive số 1
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold font-headline text-white leading-[1.1] tracking-tighter">
                Kiến tạo <span className="text-secondary-fixed">Sự nghiệp</span> <br /> Tầm cao mới.
              </h1>

              <p className="text-on-primary-container text-base max-w-xl leading-relaxed font-light">
                Kết nối những nhà lãnh đạo xuất sắc với những cơ hội nghề nghiệp đẳng cấp nhất tại Việt Nam và khu vực.
              </p>

              {/* Thanh tìm kiếm nhanh (Tích hợp trong Hero) */}
              <div className="bg-surface-container-lowest/95 backdrop-blur-md p-2 rounded-xl shadow-2xl flex flex-col md:flex-row gap-2 max-w-3xl">
                {/* Nhập từ khóa */}
                <div className="flex-1 relative">
                  <div className="flex items-center px-4 py-2.5 gap-3 border-r border-outline-variant/20">
                    <span className="material-symbols-outlined text-outline">work</span>
                    <select 
                      className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-medium outline-none cursor-pointer" 
                        value={searchIndustry}
                        onChange={(e) => setSearchIndustry(e.target.value)}
                        disabled={filtersLoading}
                      >
                        <option value="">{filtersLoading ? 'Đang tải...' : 'Ngành nghề'}</option>
                      {industries.map((industry) => (
                        <option key={industry.industryId} value={industry.nameIndustry}>{industry.nameIndustry}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Chọn địa điểm */}
                <div className="flex-1 relative">
                  <div className="flex items-center px-4 py-2.5 gap-3">
                    <span className="material-symbols-outlined text-outline">location_on</span>
                    <select
                      className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-medium outline-none cursor-pointer"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      disabled={filtersLoading}
                    >
                      <option value="">{filtersLoading ? 'Đang tải...' : 'Thành phố'}</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.city}>{loc.city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  className="bg-secondary text-on-secondary px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-on-secondary-container transition-all"
                >
                  Tìm kiếm ngay
                </button>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="bg-surface-container-lowest p-5 rounded-xl shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                        <span className="material-symbols-outlined text-sm">trending_up</span>
                      </div>
                      <div>
                        <div className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Tăng trưởng</div>
                        <div className="text-lg font-black text-primary">+45% Lương</div>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant leading-relaxed">Dành cho các vị trí quản lý cấp cao tại các tập đoàn đa quốc gia.</p>
                  </div>
                  <img className="w-full h-56 object-cover rounded-xl shadow-lg grayscale hover:grayscale-0 transition-all duration-700" alt="Confident Asian female executive smiling in a minimalist professional setting with warm natural sunlight" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYafaoPVdAQdIqLc_o6Q-0L0cDXdYOgvJ_np2qlwUmkfVtXfNzcvbePwFBj1pnuL7IoabYJBEIfMvwyK5RfGfw77cJO_GiDYzbelgEApo6wOg_HWGQ01OT2mhvrb3LulGRGwfUHAqd1FKCKm9qL8cFmcE7kkryxI6iPjcxKZWwDtWnsq-o6jMwdi5OQRQ44iPNNLcD7Mbi_V0zKSvd_6C3bzc1-XMrVPhJPXJwjpmXfcV7dTkjbh6Yuc9Qce9oQS_fsUwzZn-J4QKm" />
                </div>
                <div className="space-y-4">
                  <img className="w-full h-64 object-cover rounded-xl shadow-lg grayscale hover:grayscale-0 transition-all duration-700" alt="Professional male executive in a tailored navy suit adjusting his cufflinks in a bright modern office corridor" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCnScv-jM6zYtsRAw348i9ntSXjP0zH8Fy26gKqXWz3Le5Hcpo70rEz8KpEkxfINN2oiYpSwQkpbwiXNa2O_OAshjciv2mLs3ik0r8oS7Cqlbz89hhdoDZe-FBr886jPZrJ-nVoPeJQQdA6yr_Bo_Rkdt6_HK5rBjDuDDC-kBiSP8Xaz4_xQizVA9-0o-TZIhoQyuCFpSgwreKghbaCWiAKSd2ruEUEtX4DJVc3XU-5JFjpbH83qG5Hz1q6RieRYBds76Fd18IyJm8" />
                  <div className="bg-secondary p-5 rounded-xl shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500 text-on-secondary">
                    <div className="text-3xl font-black mb-1">500+</div>
                    <div className="text-sm font-medium opacity-80 italic">Đối tác chiến lược Fortune 500 tin tưởng JobMatch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ngành nghề nổi bật (Kiểu Bento Grid) */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div className="max-w-xl">
              <span className="text-secondary font-bold tracking-widest uppercase text-xs">Danh mục hàng đầu</span>
              <h2 className="text-2xl font-black font-headline mt-2 text-primary tracking-tight">Khám phá các lĩnh vực dẫn đầu thị trường</h2>
            </div>
            <button className="group flex items-center gap-2 text-on-surface font-bold text-sm hover:text-secondary transition-colors">
              Xem tất cả ngành nghề
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {/* Ngành IT */}
            <div className="md:col-span-2 lg:col-span-2 group cursor-pointer">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-900">
                <img className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="High tech digital circuit board background with glowing teal and blue binary data patterns" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-1_uc3ziR2-N10mmQiR4p5f4ESrarnRbKPh0UW6n8EqhG8g1NRcuZnJniDwhAinC6ZLP3w6ggiHDXlSq7CmIeCkLf_pf6svN4rYGl2mhF_FDXSTUlwsAIJoKej4AvB_ThdEj2iq-m3l5LG0Da1Y9nY5Jp3jZy1RIXzhJt4Y4z3i-6rvA9cFQVF3W1qUT_316K3ajeDIBjsWAxWwgTbYQHxno33-A6uU99UeSV_uSszs1LagLTX2yTntvS4xPQdBggXemmivL-frSr" />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-5 left-5 text-white">
                  <h3 className="text-xl font-bold font-headline">Công nghệ (IT)</h3>
                  <p className="text-sm text-slate-300">1,240 việc làm mới</p>
                </div>
              </div>
            </div>

            {/* Marketing */}
            <div className="md:col-span-2 lg:col-span-2 group cursor-pointer">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-secondary-container">
                <div className="absolute top-5 right-5">
                  <span className="material-symbols-outlined text-3xl text-on-secondary-container/30">campaign</span>
                </div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-xl font-bold font-headline text-on-secondary-container">Marketing &amp; Truyền thông</h3>
                  <p className="text-sm text-on-secondary-container/70">856 việc làm mới</p>
                </div>
              </div>
            </div>

            {/* Finance */}
            <div className="md:col-span-2 lg:col-span-2 group cursor-pointer">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-white shadow-sm border border-outline-variant/20 flex flex-col p-6 group-hover:shadow-xl transition-all">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed mb-auto text-sm">
                  <span className="material-symbols-outlined text-base">payments</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold font-headline text-primary">Tài chính</h3>
                  <p className="text-sm text-on-surface-variant">412 việc làm mới</p>
                </div>
              </div>
            </div>

            {/* Healthcare */}
            <div className="md:col-span-3 lg:col-span-3 group cursor-pointer">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/10 p-6 flex items-center gap-6 group-hover:bg-white group-hover:shadow-lg transition-all">
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-headline text-primary">Y tế &amp; Dược phẩm</h3>
                  <p className="text-sm text-on-surface-variant mb-5">Nhu cầu nhân sự cấp cao đang tăng mạnh trong năm 2024.</p>
                  <span className="inline-flex items-center gap-2 text-secondary font-bold text-xs uppercase tracking-widest">Tìm hiểu ngay <span className="material-symbols-outlined text-sm">north_east</span></span>
                </div>
                <div className="hidden sm:block w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img className="w-full h-full object-cover" alt="Clean hospital laboratory setting with medical professional in white coat working with high-tech equipment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTe4SeCqINjj2Hc-kGx4O-fTe5ZJPbub-hywo-V4ZolhEn7CmVb_6h6zlEcVus0Sc2o3CK_XX-bxsa845Ri_VxUojL3xtR5XNAmh7PLbUm5NiUbPu4qdwbRNY4sdLFCV3AdaKeqLh-K7LYMeFyBp3IXJYLbqjlGUZvVGyDlR-jssLPFgKM47AGgGgn0_Ii66daWHHjB4DFi86_K7MN3N372Rt-FkFSAAUKmdtLbXnXJKdAW6GFBlXMwmnzPNeewoFnfWg3QYpkGxLx" />
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="md:col-span-3 lg:col-span-3 group cursor-pointer">
              <div className="relative h-56 rounded-2xl overflow-hidden bg-primary p-6 flex flex-col justify-between group-hover:bg-primary-container transition-all">
                <img className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay" alt="Modern logistics warehouse with stacked containers and robotic arms in a sleek architectural environment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2DY_0lEaiOOTmUjgDSaDuAvqGhVIho_hQF5PmKz4KFvZVCqmt8R-6cfv4eXX121WR9y2bQ2jviWgCfvXmrC2TW-vs7-dxtPicSCn8EOsgVm6fQQNkkhfOrzGaJdtN18uumVAd6DsNPAWPaPzkaEoFeRd8TvuDszTr5kUp6uGW-Pz67fBmRSBBMtOX4I2XAlFsWCK12xBNpONTq8nJRBooWtWU4OWfMMIOk9EZROAggZWT4-MVMEpRj30H3C_6wjTa4fwp7k4osakz" />
                <div className="flex justify-between items-start">
                  <span className="material-symbols-outlined text-white/50 text-3xl">inventory_2</span>
                  <span className="bg-secondary/20 text-secondary-fixed text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Hot</span>
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold font-headline">Vận tải &amp; Logistics</h3>
                  <p className="text-sm text-white/60">329 việc làm mới</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Công việc nổi bật */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-3">
              <span className="text-secondary font-bold tracking-widest uppercase text-xs">Cơ hội tốt nhất cho bạn</span>
              <h2 className="text-2xl md:text-3xl font-black font-headline text-primary tracking-tight">Việc làm nổi bật</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full py-12 flex justify-center">
                  <LoadingSpinner text="Đang tải danh sách việc làm..." />
                </div>
              ) : error ? (
                // Trạng thái lỗi
                <div className="col-span-full text-center py-12">
                  <p className="text-outline mb-4">Không thể tải danh sách việc làm</p>
                  <p className="text-sm text-on-surface-variant">{error}</p>
                </div>
              ) : jobs.length === 0 ? (
                // Trạng thái rỗng
                <div className="col-span-full text-center py-12">
                  <p className="text-outline">Chưa có việc làm nào</p>
                </div>
              ) : (
                // Thẻ công việc với dữ liệu thực
                jobs.map((job, index) => (
                  <Link 
                    key={job.jobPostingId} 
                    to={`/jobs/${job.jobPostingId}`}
                    className="bg-surface-container-lowest p-6 rounded-xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group border border-outline-variant/5 block"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-xl bg-surface-container flex items-center justify-center p-2.5 border border-outline-variant/10 overflow-hidden">
                        {job.companyProfile?.avatar ? (
                          <img src={job.companyProfile.avatar} alt={getCompanyName(job)} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="bg-primary-container w-full h-full flex items-center justify-center rounded-lg text-white font-black text-xs">
                            {getCompanyName(job).substring(0, 3).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className={`${getEmploymentTypeBadgeClass(job.status)} text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase`}>
                        {getEmploymentTypeLabel(job.status)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-secondary transition-colors font-headline">
                      {job.title}
                    </h3>
                    <p className="text-on-surface-variant font-medium text-xs mb-5 flex items-center gap-1">
                      {getCompanyName(job)} <span className="text-outline mx-1">•</span> {getLocation(job.locations)}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {getSkills(job).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-5 border-t border-outline-variant/10">
                      <div>
                        <span className="text-xs text-outline block">Mức lương</span>
                        <span className="text-base font-black text-primary">
                          {formatSalary(job.salaryRequire)}
                        </span>
                      </div>
                      <Link 
                        to={`/jobs/${job.jobPostingId}`}
                        className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-on-secondary transition-all"
                      >
                        <span className="material-symbols-outlined">chevron_right</span>
                      </Link>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="mt-10 text-center">
              <Link 
                to="/jobs"
                className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-container transition-all shadow-xl shadow-primary/20"
              >
                Khám phá thêm 2,500+ công việc
              </Link>
            </div>
          </div>
        </section>

        {/* Bản tin / CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-2xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <img className="w-full h-full object-cover" alt="Abstract geometric background with sharp professional lines and deep blue corporate patterns" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWmcAJ16TQdlSJVyeCsmlI7aOxB2NrePRiFnTfWRnBmbczeR6cEAkX0Y2T3KxSIyR3-RrhJ0cHVWedmVhUtTpoLpnULRtjkOfQroHST5rcD94M6JXU_fKymgP2TSmuw6s_rFf7iaPa75WypH36jUS3iIZk_VqrPQMZ8uZSBLt0gppQW94U8KrAgQwbNJibHfqNSevq9mx9N8HeG7R3nrA-mIeKfCY-X5gumpfR4NpVBXPaT7CHIp8gwQNGZf46SDMQDmLZUN3VrNEy" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-black font-headline text-white mb-5 leading-tight">Sẵn sàng bước vào hành trình mới?</h2>
              <p className="text-on-primary-container text-base mb-8 leading-relaxed font-light">Đăng ký nhận thông báo về các vị trí Executive phù hợp nhất với hồ sơ của bạn mỗi tuần. Không spam, chỉ là những cơ hội tốt nhất.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <input className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-secondary focus:bg-white/20 outline-none transition-all" placeholder="Địa chỉ email của bạn" type="email" />
                <button className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all active:scale-95">Đăng ký ngay</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Chân trang */}
      <Footer />
    </div>
  );
};

export default HomePage;

