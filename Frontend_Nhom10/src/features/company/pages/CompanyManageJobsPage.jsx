import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import CompanySidebar from '../../../components/layout/CompanySidebar';
import Footer from '../../../components/layout/Footer';
import { toast } from 'sonner';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function CompanyManageJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    approvedJobs: 0,
    pendingJobs: 0
  });
  const [filterMode, setFilterMode] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchJobsData();
  }, [user]);

  const fetchJobsData = async () => {
    try {
      setLoading(true);
      const jobsResponse = await jobAPI.getMyJobs();

      if (jobsResponse?.data?.result) {
        const jobsData = jobsResponse.data.result || [];
        
        let approved = jobsData.filter(j => j.status === 'ACTIVE' || j.status === 'APPROVED').length;
        let pending = jobsData.filter(j => j.status === 'PENDING').length;
        let totalCands = jobsData.length; // Now used to count total jobs

        const processedJobs = [...jobsData];
        
        try {
          const appPromises = jobsData.map(job => jobAPI.getApplicationsByJobId(job.jobPostingId || job.id).catch(() => null));
          const appResponses = await Promise.all(appPromises);
          appResponses.forEach((res, idx) => {
            const apps = (res && res.data?.result) ? res.data.result : [];
            const count = apps.length;
            processedJobs[idx].applicationCount = count;
          });
        } catch(e) {
          console.error('Error fetching applications for stats', e);
        }
        
        setJobs(processedJobs);
        setStats({
          totalJobs: totalCands,
          approvedJobs: approved,
          pendingJobs: pending
        });
      }
    } catch (err) {
      console.error('Error fetching manage jobs data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleJobVisibility = async (job) => {
    try {
      const id = job.jobPostingId || job.id;
      if (job.status === 'CLOSED') {
        await jobAPI.reopenJob(id);
        toast.success(`Đã hiển thị lại tin: ${job.title}`);
      } else {
        await jobAPI.closeJob(id);
        toast.success(`Đã ẩn tin: ${job.title}`);
      }
      fetchJobsData(); // Refresh list after toggle
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái tin');
    }
  };

  const handleDeleteJob = async (job) => {
    if(window.confirm(`Bạn có chắc chắn muốn xóa tin "${job.title}" vĩnh viễn?`)) {
      try {
        const id = job.jobPostingId || job.id;
        await jobAPI.deleteJob(id);
        toast.success("Xóa tin tuyển dụng thành công");
        fetchJobsData();
      } catch(error) {
        console.error(error);
        if (error?.response?.status === 405 || error?.response?.status === 404) {
           toast.error(`Backend chưa hỗ trợ API xóa. Xin vui lòng liên hệ admin.`);
        } else {
           toast.error("Không thể xử lý xóa tin");
        }
      }
    }
  };

  // Xử lý phân trang
  const filteredJobs = jobs.filter(job => {
        if (filterMode === 'ALL') return true;
        if (filterMode === 'APPROVED') return job.status === 'ACTIVE' || job.status === 'APPROVED';
        if (filterMode === 'PENDING') return job.status === 'PENDING';
        return true;
    });

    const indexOfLastJob = currentPage * itemsPerPage;
  const indexOfFirstJob = Math.max(0, indexOfLastJob - itemsPerPage);
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / itemsPerPage));

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
      <Header />
      <div className="flex flex-1 pt-16">
        <CompanySidebar />
        
        <main className="flex-1 bg-surface min-h-screen overflow-y-auto">
          {/* Header Section */}
          <header className="h-20 glass-nav bg-white/80 sticky top-0 z-30 flex items-center justify-between px-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-primary">Quản lý tin tuyển dụng</h2>
              <p className="text-sm text-on-surface-variant">Chào mừng trở lại, bạn đang có {stats.approvedJobs} tin tuyển dụng đang hoạt động.</p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="relative hidden lg:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input className="pl-10 pr-4 py-2 bg-surface-container-highest border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-secondary/20 transition-all" placeholder="Tìm kiếm tin..." type="text" />
              </div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <Link to="/company/create-job" className="hidden lg:flex px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm shadow-sm hover:shadow-md hover:bg-secondary/90 transition-all items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Đăng tin mới
              </Link>
            </div>
          </header>

          <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Quick Stats Bento Grid */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary-fixed rounded-lg text-primary">
                    <span className="material-symbols-outlined">work</span>
                  </div>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">+12%</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-4 font-medium uppercase tracking-wider">Tổng số tin</p>
                <h3 className="text-3xl font-black mt-1">{stats.totalJobs || jobs.length}</h3>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-secondary-fixed rounded-lg text-secondary">
                    <span className="material-symbols-outlined">check_circle</span>
                  </div>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">+5.4%</span>
                </div>
                <p className="text-on-surface-variant text-sm mt-4 font-medium uppercase tracking-wider">Tin đã duyệt</p>
                <h3 className="text-3xl font-black mt-1">{stats.approvedJobs || 0}</h3>
              </div>
              
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-transparent shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed">
                    <span className="material-symbols-outlined">pending_actions</span>
                  </div>
                </div>
                <p className="text-on-surface-variant text-sm mt-4 font-medium uppercase tracking-wider">Tin chờ duyệt</p>
                <h3 className="text-3xl font-black mt-1">{stats.pendingJobs || 0}</h3>
              </div>
              
              <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-primary-fixed text-sm font-medium uppercase tracking-wider">Gói hiện tại</p>
                  <h3 className="text-2xl font-bold mt-1">Enterprise Plus</h3>
                  <p className="text-xs text-primary-fixed/80 mt-2">Còn lại 15 lượt đăng tin cao cấp</p>
                </div>
                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 group-hover:scale-110 transition-transform">workspace_premium</span>
              </div>
            </section>

            {/* Job Management List (Editorial Style) */}
            <section className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-extrabold tracking-tight">Danh sách tin đăng</h3>
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap">
                  <button onClick={() => { setFilterMode('ALL'); setCurrentPage(1); }} className={`px-4 py-2 ${filterMode === 'ALL' ? 'bg-white text-slate-800 border-slate-200 shadow-sm' : 'border-transparent bg-transparent text-slate-500 hover:text-secondary'} border rounded-lg text-sm font-semibold transition-all`}>Tất cả</button>
                    <button onClick={() => { setFilterMode('APPROVED'); setCurrentPage(1); }} className={`px-4 py-2 ${filterMode === 'APPROVED' ? 'bg-white text-slate-800 border-slate-200 shadow-sm' : 'border-transparent bg-transparent text-slate-500 hover:text-secondary'} border rounded-lg text-sm font-semibold transition-all`}>Đã duyệt</button>
                    <button onClick={() => { setFilterMode('PENDING'); setCurrentPage(1); }} className={`px-4 py-2 ${filterMode === 'PENDING' ? 'bg-white text-slate-800 border-slate-200 shadow-sm' : 'border-transparent bg-transparent text-slate-500 hover:text-secondary'} border rounded-lg text-sm font-semibold transition-all`}>Chờ duyệt</button>
                </div>
              </div>

              {loading ? (
                  <LoadingSpinner text="Đang tải danh sách tin tuyển dụng..." />
              ) : currentJobs.length === 0 ? (
                <div className="bg-surface-container-lowest p-6 rounded-xl flex flex-col items-center justify-center gap-4 text-slate-500">
                  <span className="material-symbols-outlined text-4xl">work_off</span>
                  <span>Chưa có tin tuyển dụng nào phù hợp</span>
                </div>
              ) : (
                currentJobs.map(job => {
                  const isVisuallyActive = job.status === 'ACTIVE' || job.status === 'APPROVED' || job.status === 'PENDING';
                    const isAdminApproved = job.status === 'ACTIVE' || job.status === 'APPROVED';
                  
                  let statusBtnText = 'Đã ẩn';
                  let statusBtnClass = 'bg-slate-400 text-white cursor-not-allowed';
                  if (job.status === 'ACTIVE' || job.status === 'APPROVED') {
                    statusBtnText = 'Xem ứng viên';
                    statusBtnClass = 'bg-secondary text-white hover:shadow-md active:scale-95';
                  } else if (job.status === 'PENDING') {
                    statusBtnText = 'Chờ duyệt';
                    statusBtnClass = 'bg-amber-500 text-white cursor-not-allowed';
                  } else if (job.status === 'REJECTED') {
                    statusBtnText = 'Từ chối';
                    statusBtnClass = 'bg-error text-white cursor-not-allowed';
                  } else if (job.status === 'EXPIRED') {
                    statusBtnText = 'Hết hạn';
                    statusBtnClass = 'bg-slate-600 text-white cursor-not-allowed';
                  }

                  return (
                  <div key={job.jobPostingId || job.id} className={`group relative ${isVisuallyActive ? 'bg-surface-container-lowest border-transparent hover:border-teal-100' : 'bg-surface-container-low opacity-75 border-transparent'} p-6 rounded-xl flex flex-col lg:flex-row lg:items-center gap-8 border transition-all duration-300`}>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 ${isVisuallyActive ? 'bg-teal-50 text-teal-700' : 'bg-slate-200 text-slate-600'} text-[10px] font-bold uppercase tracking-widest rounded`}>
                          {job.position || 'Full-time'}
                        </span>
                        <span className="text-xs text-slate-400">Đăng ngày: {new Date(job.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <Link to={`/jobs/${job.jobPostingId || job.id}`}>
                        <h4 className={`text-xl font-bold ${isVisuallyActive ? 'text-slate-900 group-hover:text-teal-700' : 'text-slate-500'} transition-colors`}>{job.title}</h4>
                      </Link>
                      <div className={`flex gap-4 text-sm ${isVisuallyActive ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">location_on</span> {(job.locations && job.locations[0]?.city) || job.location || 'TP.HCM'}</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">payments</span> {job.salaryRequire} USD</span>
                      </div>
                    </div>

                    {/* Statistics Internal Grid */}
                    <div className={`flex items-center gap-12 px-8 py-2 border-l border-r ${isVisuallyActive ? 'border-slate-50' : 'border-slate-200/50'}`}>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Lượt xem</p>
                        <p className={`text-lg font-black ${isVisuallyActive ? '' : 'text-slate-400'}`}>{job.views || Math.floor(Math.random() * 1000) + 100}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Ứng tuyển</p>
                        <p className={`text-lg font-black ${isVisuallyActive ? 'text-secondary' : 'text-slate-400'}`}>{job.applicationCount || 0}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col xl:flex-row gap-2">        
                      <Link to={`/company/edit-job/${job.jobPostingId || job.id}`} className="block p-3 text-slate-400 hover:text-secondary hover:bg-secondary-fixed transition-all rounded-lg active:scale-90" title="Chỉnh sửa">
                        <span className="material-symbols-outlined">edit</span> 
                      </Link>
                      <button
                        onClick={() => {
                          alert('Tính năng đang phát triển');
                        }}
                        className="p-3 text-slate-400 hover:text-secondary hover:drop-shadow-md hover:bg-secondary-fixed transition-all rounded-lg active:scale-90"
                        title="Ẩn tin"
                      >
                        <span className="material-symbols-outlined">
                          visibility
                        </span>
                      </button>
                      {isAdminApproved ? (
                        <Link to={`/company/candidates?jobId=${job.jobPostingId || job.id}`} className={`ml-auto xl:ml-2 px-6 py-2 ${statusBtnClass} rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center`}>
                          {statusBtnText}
                        </Link>
                      ) : (
                        <button disabled className={`ml-auto xl:ml-2 px-6 py-2 ${statusBtnClass} rounded-lg font-bold text-sm shadow-sm transition-all flex items-center justify-center`}>
                          {statusBtnText}
                        </button>
                      )}
                    </div>
                  </div>
                )})
              )}
            </section>

            {/* Bottom Action & Pagination */}
            {!loading && jobs.length > 0 && (
              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-500">Hiển thị <span className="font-bold text-slate-900">{indexOfFirstJob + 1}-{Math.min(indexOfLastJob, jobs.length)}</span> trên tổng số <span className="font-bold text-slate-900">{jobs.length}</span> tin đăng</p>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold ${currentPage === page ? 'bg-primary text-white' : 'hover:bg-slate-100 text-slate-600'}`}>
                      {page}
                    </button>
                  ))}

                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Integration */}
          <footer className="w-full py-12 px-8 bg-white border-t border-slate-100 mt-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <span className="material-symbols-outlined text-teal-600 text-3xl">work</span>
                <span className="font-manrope font-black text-xl tracking-tight text-slate-900 border-l-2 border-teal-600 pl-2">JobRadar<span className="text-teal-600 text-sm align-top">©</span></span>
              </div>
              <div className="flex gap-6">
                <a className="font-manrope text-xs text-slate-400 hover:text-teal-600 transition-colors" href="/">Terms of Service</a>
                <a className="font-manrope text-xs text-slate-400 hover:text-teal-600 transition-colors" href="/">Cookie Policy</a>
                <a className="font-manrope text-xs text-slate-400 hover:text-teal-600 transition-colors" href="/">Global Offices</a>
              </div>
            </div>
          </footer>
        </main>
      </div>

      <Link to="/company/create-job" className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-secondary text-on-secondary rounded-full shadow-xl flex items-center justify-center active:scale-90 transition-transform z-50">
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  );
}

export default CompanyManageJobsPage;
