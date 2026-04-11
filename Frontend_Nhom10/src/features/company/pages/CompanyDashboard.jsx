import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import CompanySidebar from '../../../components/layout/CompanySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function CompanyDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewSchedule: 0
  });
  const [chartPeriod, setChartPeriod] = useState('7');
  const [chartData, setChartData] = useState({ data: [], labels: [], max: 10 });
  const [myJobs, setMyJobs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  useEffect(() => {
    if (allApplications.length >= 0 && !loading) {
      updateChartData(allApplications, chartPeriod);
    }
  }, [chartPeriod, allApplications, loading]);

  const updateChartData = (apps, period) => {
    const days = parseInt(period, 10);
    const cData = new Array(days).fill(0);
    const labels = new Array(days).fill('');
    const now = new Date();
    
    // Tạo labels và đếm
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(now.getDate() - (days - 1 - i));
        
        if (days === 7) {
            const dayNames = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
            labels[i] = dayNames[d.getDay()];
        } else {
            if (i % 5 === 0 || i === days - 1) {
               labels[i] = `${d.getDate()}/${d.getMonth()+1}`;
            } else {
               labels[i] = '';
            }
        }
    }
    
    const startPeriod = new Date(now);
    startPeriod.setDate(now.getDate() - days + 1);
    startPeriod.setHours(0,0,0,0);

    apps.forEach(app => {
       const d = new Date(app.appliedAt || app.createdAt);
       if (d >= startPeriod) {
           const diffTime = d.getTime() - startPeriod.getTime();
           const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
           if (diffDays >= 0 && diffDays < days) {
               cData[diffDays]++;
           }
       }
    });

    const maxApps = Math.max(...cData, 5);
    setChartData({ data: cData, labels, max: maxApps });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jobsResponse = await jobAPI.getMyJobs();
      
      if (jobsResponse?.data?.result) {
        const jobs = jobsResponse.data.result || [];
        setMyJobs(jobs);

        const totalJobs = jobs.length;
        
        let allApps = [];
        try {
          const appPromises = jobs.map(job => jobAPI.getApplicationsByJobId(job.jobPostingId || job.id).catch(() => null));
          const appResponses = await Promise.all(appPromises);
          appResponses.forEach((res, index) => {
            if (res && res.data?.result) {
              const jobApps = res.data.result.map(app => ({
                ...app,
                jobTitle: jobs[index].title
              }));
              allApps = allApps.concat(jobApps);
            }
          });
        } catch (e) {
          console.error('Error fetching applications:', e);
        }
        
        setAllApplications(allApps);
        const totalApplications = allApps.length;
        
        // Count applications pending or new
        const pendingApps = allApps.filter(app => app.status === 'PENDING' || app.status === 'NEW' || app.status === 'REVIEWING').length;

        setStats({
          totalJobs,
          totalApplications,
          pendingApplications: pendingApps || 0,
          interviewSchedule: 0 // Mock since no dedicated API available for schedule yet
        });
        
        allApps.sort((a, b) => new Date(b.appliedAt || b.createdAt).getTime() - new Date(a.appliedAt || a.createdAt).getTime());
        
        const recentCandidates = allApps.slice(0, 5).map(app => {
           const applicantName = app.name || (app.candidateProfile?.user?.name) || app.email || 'Ứng viên';
           return {
              type: 'application',
              name: applicantName,
              title: app.jobTitle,
              timestamp: app.appliedAt || app.createdAt,
              status: app.status,
              avatar: app.candidateProfile?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(applicantName)}&background=random`
           };
        });
        
        setRecentActivity(recentCandidates);
      } else {
        setMyJobs([]);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Không thể tải dữ liệu bảng điều khiển');
      setMyJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRelative = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (diff < 60000) return 'vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 86400000 * 5) return `${Math.floor(diff / 86400000)} ngày trước`;
    return d.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex flex-1 pt-16">
          <CompanySidebar />
          <main className="flex-1 p-8 bg-surface overflow-y-auto flex items-center justify-center">
              <LoadingSpinner text="Đang tải dữ liệu tổng quan..." />
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      <div className="flex flex-1 pt-16">
        <CompanySidebar />
        <main className="flex-1 p-8 bg-surface-container-low overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div className="mb-10">
              <h1 className="text-3xl font-extrabold text-primary font-headline tracking-tight mb-2">Bảng điều khiển Phân tích</h1>
              <p className="text-on-surface-variant font-body">Chào mừng trở lại! Dưới đây là tóm tắt hoạt động tuyển dụng của bạn trong tuần này.</p>
            </div>

            {/* Stat Cards Grid (4 columns exactly like template) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {/* Card 1: Tin đang đăng */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between group hover:translate-y-[-2px] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#e8f1fd] rounded-lg text-[#005bb5] flex items-center justify-center">
                    <span className="material-symbols-outlined">receipt_long</span>
                  </div>
                  <span className="bg-[#bce3ed] text-[#006059] text-[10px] font-bold px-2 py-1 rounded-full">+2 tuần này</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Tin đang đăng</p>
                  <p className="text-3xl font-extrabold text-primary tracking-tight">{stats.totalJobs < 10 ? `0${stats.totalJobs}` : stats.totalJobs}</p>
                </div>
              </div>

              {/* Card 2: Tổng đơn ứng tuyển */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#bcf0da] rounded-lg text-[#00705a] flex items-center justify-center">
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <span className="bg-[#bcf0da] text-[#00705a] text-[10px] font-bold px-2 py-1 rounded-full">+18%</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Tổng đơn ứng tuyển</p>
                  <p className="text-3xl font-extrabold text-primary tracking-tight">{stats.totalApplications < 10 ? `0${stats.totalApplications}` : stats.totalApplications}</p>
                </div>
              </div>

              {/* Card 3: Ứng tuyển mới */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#ffe7d1] rounded-lg text-[#b84a00] flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">verified</span>
                  </div>
                  <span className="bg-[#fff0e3] text-[#b84a00] text-[10px] font-bold px-2 py-1 rounded-full">Cần xử lý</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Ứng tuyển mới</p>
                  <p className="text-3xl font-extrabold text-primary tracking-tight">{stats.pendingApplications < 10 ? `0${stats.pendingApplications}` : stats.pendingApplications}</p>
                </div>
              </div>

              {/* Card 4: Lịch phỏng vấn */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:translate-y-[-2px] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#e0e0ff] rounded-lg text-[#4040a1] flex items-center justify-center">
                    <span className="material-symbols-outlined">calendar_month</span>
                  </div>
                  <span className="bg-[#e0e0ff] text-[#4040a1] text-[10px] font-bold px-2 py-1 rounded-full">Hôm nay: {stats.interviewSchedule > 0 ? stats.interviewSchedule : '0'}</span>
                </div>
                <div>
                  <p className="text-on-surface-variant text-sm font-medium mb-1">Lịch phỏng vấn</p>
                  <p className="text-3xl font-extrabold text-primary tracking-tight">{stats.interviewSchedule < 10 ? `0${stats.interviewSchedule}` : stats.interviewSchedule}</p>
                </div>
              </div>
            </div>

            {/* Charts & Recent Activity Grid (3 columns total matching template: 2 for Chart, 1 for List) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-6 px-8 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary mb-1">Xu hướng ứng tuyển</h3>
                    <p className="text-sm text-on-surface-variant">Thống kê số lượng đơn đăng ký trong {chartPeriod} ngày qua</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setChartPeriod('7')} 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${chartPeriod === '7' ? 'bg-[#006b5c] text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      7 Ngày
                    </button>
                    <button 
                      onClick={() => setChartPeriod('30')} 
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${chartPeriod === '30' ? 'bg-[#006b5c] text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}
                    >
                      30 Ngày
                    </button>
                  </div>
                </div>

                {/* Chart Bars */}
                <div className="h-64 relative flex items-end gap-x-2 lg:gap-x-4 px-2 border-b border-l border-slate-100 mb-6">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-slate-50 w-full h-px"></div>
                    <div className="border-t border-slate-50 w-full h-px"></div>
                    <div className="border-t border-slate-50 w-full h-px"></div>
                    <div className="border-t border-slate-50 w-full h-px"></div>
                  </div>

                  {chartData.data.map((value, i) => {
                     // Biểu đồ thật cần chiều cao dựa trên max value
                     const heightPercent = chartData.max === 0 ? "10%" : ((value / chartData.max) * 100) + "%";
                     // Màu xanh đậm cho cột cao nhất hoặc ngày hôm nay (tạm dùng ngày cuối cùng làm "hôm nay")
                     const isHighlight = i === chartData.data.length - 1; 
                     return (
                        <div key={i} className={`flex-1 ${isHighlight ? "bg-[#006b5c]" : "bg-[#f1f5f9]"} hover:bg-primary-fixed transition-colors rounded-t-sm lg:rounded-t-md relative group`} style={{ height: heightPercent, minHeight: '4px' }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {value} đơn
                          </div>
                        </div>
                     );
                  })}
                </div>
                
                {/* Chart Labels */}
                <div className="flex justify-between text-[10px] font-bold text-on-surface-variant px-2 uppercase tracking-widest">
                  {chartData.labels.map((label, i) => (
                      <span key={i} className={label ? "flex-1 text-center" : "flex-1 text-center hidden sm:block"}>{label}</span>
                  ))}
                </div>
              </div>

              {/* Recent Applications List */}
              <div className="lg:col-span-1 bg-surface-container-lowest rounded-xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-primary font-headline tracking-tight">Ứng tuyển gần đây</h2>
                  <Link to="/company/applicants" className="text-[#006b5c] text-xs font-bold hover:underline">Xem tất cả</Link>
                </div>
                
                <div className="space-y-6 flex-1 overflow-y-auto pr-2 no-scrollbar">
                  {recentActivity.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">Chưa có ứng viên nào.</p>
                  ) : (
                    recentActivity.map((activity, i) => (
                      <div key={i} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <img 
                            src={activity.avatar} 
                            alt={activity.name} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activity.name)}&background=random` }}
                          />
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="text-sm font-bold text-primary truncate group-hover:text-[#006b5c] transition-colors">{activity.name}</h3>
                            <p className="text-xs text-on-surface-variant truncate mt-0.5">{activity.title} • {formatDateRelative(activity.timestamp)}</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.status === 'PENDING' || activity.status === 'NEW' ? 'bg-[#006b5c]' : 'bg-transparent'}`}></div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="mt-8 pt-4">
                  <Link to="/company/applicants">
                    <button className="w-full py-3 bg-[#f1f5f9] text-primary font-headline text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
                      QUẢN LÝ TẤT CẢ ỨNG VIÊN
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyDashboard;
