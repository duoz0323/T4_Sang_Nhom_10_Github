import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI, profileAPI } from '../../../services/api';
import { ensureAuthenticated } from '../../../services/guestAuth';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import CompanySidebar from '../../../components/layout/CompanySidebar';

function CompanyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    totalViews: 0,
    pendingApproval: 0
  });
  const [myJobs, setMyJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching company dashboard data...');

      // Đảm bảo token tồn tại
      await ensureAuthenticated();

      // Lấy công việc của công ty (cho thống kê + hoạt động)
      const jobsResponse = await jobAPI.getMyJobs();
      console.log('📋 Jobs response:', jobsResponse);

      if (jobsResponse?.data?.result) {
        const jobs = jobsResponse.data.result || [];
        setMyJobs(jobs);

        // Tính toán thống kê từ công việc
        const totalJobs = jobs.length;
        const pendingJobs = jobs.filter(j => j.status === 'PENDING').length;

        // Tính toán thống kê gần đúng (Backend có thể chưa có phân tích chi tiết)
        let totalApplications = 0;
        let totalViews = 0;

        // Nếu backend cung cấp applicationCount & viewCount, sử dụng chúng
        jobs.forEach(job => {
          totalApplications += (job.applicationCount || 0);
          totalViews += (job.viewCount || 0);
        });

        setStats({
          totalJobs,
          totalApplications,
          totalViews: totalViews || totalJobs * 10, // Ước tính mặc định
          pendingApproval: pendingJobs
        });

        // Tạo hoạt động gần đây từ công việc
        const activities = jobs
          .slice(0, 3)
          .map(job => ({
            type: job.status === 'PENDING' ? 'pending' : 'approved',
            title: job.status === 'PENDING' ? 'Tin chờ duyệt' : 'Tin đã duyệt',
            description: `${job.title}`,
            company: job.companyProfile?.companyName || 'Company',
            timestamp: new Date(job.createdAt || Date.now()),
            icon: job.status === 'PENDING' ? 'schedule' : 'check_circle'
          }));

        setRecentActivity(activities);
      } else {
        console.warn('⚠️ No jobs data');
        setMyJobs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching dashboard:', err);
      setError('Không thể tải dữ liệu bảng điều khiển');
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    return d.toLocaleDateString('vi-VN');
  };

  const StatCard = ({ icon, label, value, color = 'primary' }) => (
    <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 bg-${color}-container rounded-lg flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-${color}`}>{icon}</span>
        </div>
        <div>
          <p className="text-sm text-on-surface-variant">{label}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex flex-1 pt-16">
          <CompanySidebar />
          <main className="flex-1 p-8 bg-surface overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-primary animate-spin">refresh</span>
              <p className="mt-4 text-on-surface-variant">Đang tải dữ liệu...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Tiêu đề */}
      <Header />

      {/* Nội dung chính với thanh bên */}
      <div className="flex flex-1 pt-16">
        {/* Thanh bên */}
        <CompanySidebar />

        {/* Vùng nội dung chính */}
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Tiêu đề trang */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Bảng điều khiển</h1>
              <p className="text-on-surface-variant">Chào mừng, {user?.companyName || user?.name || 'Công ty'}</p>
              {error && (
                <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Lưới thống kê */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard icon="work" label="Tin tuyển dụng" value={stats.totalJobs} color="primary" />
              <StatCard icon="group" label="Ứng viên" value={stats.totalApplications} color="secondary" />
              <StatCard icon="visibility" label="Lượt xem" value={stats.totalViews} color="tertiary" />
              <StatCard icon="schedule" label="Chờ duyệt" value={stats.pendingApproval} color="error" />
            </div>

            {/* Các hành động nhanh */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm mb-8">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">lightning_bolt</span>
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/company/post-job"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container hover:border-secondary transition-all group"
                >
                  <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-medium">Đăng tin tuyển dụng</span>
                </Link>
                <Link
                  to="/company/applicants"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container hover:border-secondary transition-all group"
                >
                  <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">person_search</span>
                  <span className="font-medium">Xem ứng viên</span>
                </Link>
                <Link
                  to="/company/profile"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container hover:border-secondary transition-all group"
                >
                  <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">business</span>
                  <span className="font-medium">Cập nhật hồ sơ</span>
                </Link>
              </div>
            </div>

            {/* Các công việc gần đây của tôi */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm mb-8">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">list_alt</span>
                Tin tuyển dụng gần đây ({myJobs.length})
              </h2>
              {myJobs.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">no_meetings</span>
                  <p className="text-on-surface-variant">Chưa có tin tuyển dụng nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myJobs.slice(0, 5).map(job => (
                    <div key={job.jobPostingId} className="flex items-start gap-4 p-4 rounded-lg hover:bg-surface-container transition-colors border border-outline-variant/50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-on-surface">{job.title}</h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            job.status === 'ACTIVE' ? 'bg-secondary text-white' :
                            job.status === 'PENDING' ? 'bg-error-container text-on-error-container' :
                            'bg-surface-container text-on-surface-variant'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant">
                          {job.locations?.map(l => l.city).join(', ') || 'N/A'} •
                          Mức lương: {job.salaryRequire ? `${(job.salaryRequire / 1000000).toFixed(0)}M VNĐ` : 'Thỏa thuận'}
                        </p>
                      </div>
                      <Link
                        to={`/jobs/${job.jobPostingId}`}
                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-container transition-all"
                      >
                        Xem
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hoạt động gần đây */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">notifications_active</span>
                Hoạt động gần đây
              </h2>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-on-surface-variant">Chưa có hoạt động nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low">
                      <span className={`material-symbols-outlined ${activity.type === 'pending' ? 'text-error' : 'text-secondary'}`}>
                        {activity.icon}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-on-surface">{activity.title}</p>
                        <p className="text-sm text-on-surface-variant">{activity.description}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Chân trang */}
      <Footer />
    </div>
  );
}

export default CompanyDashboard;
