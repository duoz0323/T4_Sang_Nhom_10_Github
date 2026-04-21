import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import api from '../../../services/api';
import { jobAPI, companyAPI } from '../../../services/api';

// ─── Mini bar chart component ───────────────────────────────────
const MiniBarChart = ({ data, max, color = '#1976d2' }) => (
  <div className="flex items-end gap-1 h-16">
    {data.map((v, i) => (
      <div
        key={i}
        className="flex-1 rounded-t-sm transition-all"
        style={{
          height: max === 0 ? '4px' : `${Math.max(4, (v / max) * 64)}px`,
          backgroundColor: i === data.length - 1 ? color : `${color}55`,
        }}
        title={`${v}`}
      />
    ))}
  </div>
);

// ─── Stat card ───────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, iconBg, iconColor, trend, chart, chartColor }) => (
  <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5 hover:-translate-y-0.5 transition-transform">
    <div className="flex justify-between items-start mb-3">
      <div className={`w-11 h-11 ${iconBg} ${iconColor} rounded-lg flex items-center justify-center`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      {trend !== undefined && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-[#fce4ec] text-[#c62828]'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-sm text-on-surface-variant font-medium mb-1">{label}</p>
    <p className="text-3xl font-extrabold text-primary mb-1">{value}</p>
    {sub && <p className="text-xs text-on-surface-variant">{sub}</p>}
    {chart && <div className="mt-3"><MiniBarChart data={chart} max={Math.max(...chart, 1)} color={chartColor} /></div>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────
const AdminStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState({
    candidates: [],
    companies: [],
    pendingPosts: [],
    activePosts: [],
    industries: [],
    locations: [],
    skills: [],
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Dùng allSettled: Dù có API lỗi mạng (Render đang ngủ) hoặc 403, các API khác vẫn load bình thường
      const results = await Promise.allSettled([
        api.get('/candidate_profile/profiles'),
        api.get('/company_profile/profiles'),
        jobAPI.getPendingJobs ? jobAPI.getPendingJobs() : Promise.resolve({ data: { result: [] } }),
        jobAPI.getAllActiveJobs ? jobAPI.getAllActiveJobs({ size: 9999 }) : Promise.resolve({ data: { result: [] } }),
        api.get('/industries'),
        api.get('/locations'),
        api.get('/skills'),
      ]);

      // Hàm bóc tách data an toàn
      const safeData = (index) => {
        if (results[index].status === 'fulfilled' && results[index].value) {
          return results[index].value.data?.result || results[index].value.data?.content || [];
        }
        return [];
      };

      setRaw({
        candidates:   safeData(0),
        companies:    safeData(1),
        pendingPosts: safeData(2),
        activePosts:  safeData(3),
        industries:   safeData(4),
        locations:    safeData(5),
        skills:       safeData(6),
      });

    } catch (err) {
      toast.error('Có lỗi xảy ra khi tổng hợp dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // ── Tính toán số liệu ──
  const totalCandidates = raw.candidates.length;
  const activeCandidates = raw.candidates.filter(c => c.status !== false).length;
  const lockedCandidates = totalCandidates - activeCandidates;

  const totalCompanies = raw.companies.length;
  const activeCompanies = raw.companies.filter(c => c.status !== false).length;
  const lockedCompanies = totalCompanies - activeCompanies;

  const totalPending = raw.pendingPosts.length;
  const totalActive  = raw.activePosts.length;
  const totalPosts   = totalPending + totalActive;

const locationCount = {};
  raw.activePosts.forEach(p => {
    // Lấy city từ phần tử đầu tiên của mảng locations
    const loc = p.locations && p.locations.length > 0 ? p.locations[0].city : 'Khác';
    locationCount[loc] = (locationCount[loc] || 0) + 1;
  });
  const topLocations = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 2. Phân bổ lĩnh vực
  const industryCount = {};
  raw.activePosts.forEach(p => {
    // Lấy nameIndustry từ đối tượng industry
    const name = p.industry?.nameIndustry || 'Khác';
    industryCount[name] = (industryCount[name] || 0) + 1;
  });
  const topIndustries = Object.entries(industryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // 3. Phân bổ doanh nghiệp đăng tin nhiều nhất
  const companyPostCount = {};
  raw.activePosts.forEach(p => {
    // Lấy companyName từ đối tượng companyProfile
    const name = p.companyProfile?.companyName || 'Không rõ';
    companyPostCount[name] = (companyPostCount[name] || 0) + 1;
  });
  const topCompanies = Object.entries(companyPostCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 4. Phân bổ hình thức làm việc
  const formatCount = {};
  raw.activePosts.forEach(p => {
    // Nếu BE chưa trả về trường này rõ ràng, để mặc định là 'Toàn thời gian' hoặc check lại key
    const fmt = p.workingFormat || 'Toàn thời gian'; 
    formatCount[fmt] = (formatCount[fmt] || 0) + 1;
  });
  const workingFormats = Object.entries(formatCount).sort((a, b) => b[1] - a[1]);

  // Mini chart data (7 mục cuối làm data giả cho chart, vì không có timeseries)
  const chartData7 = [3, 5, 4, 7, 6, 8, 9]; // placeholder

  const statCards = [
    {
      icon: 'person',
      label: 'Tổng ứng viên',
      value: loading ? '—' : totalCandidates,
      sub: `${activeCandidates} hoạt động · ${lockedCandidates} bị khóa`,
      iconBg: 'bg-[#e8f5e9]', iconColor: 'text-[#2e7d32]',
      chart: chartData7, chartColor: '#2e7d32',
    },
    {
      icon: 'business',
      label: 'Tổng doanh nghiệp',
      value: loading ? '—' : totalCompanies,
      sub: `${activeCompanies} hoạt động · ${lockedCompanies} bị khóa`,
      iconBg: 'bg-[#e3f2fd]', iconColor: 'text-[#1565c0]',
      chart: chartData7, chartColor: '#1565c0',
    },
    {
      icon: 'article',
      label: 'Tin tuyển dụng',
      value: loading ? '—' : totalPosts,
      sub: `${totalActive} đang hiển thị · ${totalPending} chờ duyệt`,
      iconBg: 'bg-[#fff3e0]', iconColor: 'text-[#e65100]',
      chart: chartData7, chartColor: '#e65100',
    },
    {
      icon: 'category',
      label: 'Tổng danh mục',
      value: loading ? '—' : raw.industries.length + raw.locations.length + raw.skills.length,
      sub: `${raw.industries.length} lĩnh vực · ${raw.locations.length} địa điểm · ${raw.skills.length} kỹ năng`,
      iconBg: 'bg-[#f3e5f5]', iconColor: 'text-[#6a1b9a]',
      chart: [2, 3, 3, 4, 4, 5, raw.industries.length + raw.locations.length + raw.skills.length],
      chartColor: '#6a1b9a',
    },
  ];

  // ── Skeleton ──
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex flex-1 pt-16">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto">
              <div className="mb-6">
                <div className="h-8 w-64 bg-surface-container animate-pulse rounded-lg mb-2" />
                <div className="h-4 w-96 bg-surface-container animate-pulse rounded-lg" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {[1,2,3,4].map(i => <div key={i} className="h-44 bg-surface-container animate-pulse rounded-xl" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {[1,2,3,4].map(i => <div key={i} className="h-64 bg-surface-container animate-pulse rounded-xl" />)}
              </div>
            </div>
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
        <AdminSidebar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Tiêu đề */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-primary">Thống kê hệ thống</h1>
                <p className="text-sm text-on-surface-variant mt-1">Tổng quan số liệu toàn hệ thống tuyển dụng</p>
              </div>
              <button
                onClick={fetchAll}
                className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
                Làm mới
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
              {statCards.map((card, i) => <StatCard key={i} {...card} />)}
            </div>

            {/* Hàng 2: Trạng thái bài đăng + Hình thức làm việc */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

              {/* Trạng thái tin đăng */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e65100]">pending_actions</span>
                  Trạng thái tin tuyển dụng
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Đang hiển thị (ACTIVE)', value: totalActive, color: '#2e7d32', bg: 'bg-[#2e7d32]' },
                    { label: 'Chờ duyệt (PENDING)',    value: totalPending, color: '#e65100', bg: 'bg-[#e65100]' },
                  ].map((item, i) => {
                    const pct = totalPosts === 0 ? 0 : Math.round((item.value / totalPosts) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-on-surface">{item.label}</span>
                          <span className="font-bold" style={{ color: item.color }}>{item.value} ({pct}%)</span>
                        </div>
                        <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.bg} rounded-full transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-4 pt-4 border-t border-outline-variant grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Tổng cộng', value: totalPosts, color: 'text-primary' },
                      { label: 'Đang hiển thị', value: totalActive, color: 'text-[#2e7d32]' },
                      { label: 'Chờ duyệt', value: totalPending, color: 'text-[#e65100]' },
                    ].map((s, i) => (
                      <div key={i}>
                        <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hình thức làm việc */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1565c0]">work</span>
                  Hình thức làm việc
                </h2>
                {workingFormats.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-3">
                    {workingFormats.map(([fmt, count], i) => {
                      const pct = totalActive === 0 ? 0 : Math.round((count / totalActive) * 100);
                      const colors = ['#1565c0', '#6a1b9a', '#2e7d32', '#e65100', '#c62828'];
                      const bg = ['bg-[#1565c0]', 'bg-[#6a1b9a]', 'bg-[#2e7d32]', 'bg-[#e65100]', 'bg-[#c62828]'];
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium text-on-surface">{fmt}</span>
                            <span className="font-bold" style={{ color: colors[i % colors.length] }}>{count} tin ({pct}%)</span>
                          </div>
                          <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
                            <div
                              className={`h-full ${bg[i % bg.length]} rounded-full transition-all duration-700`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Hàng 3: Top địa điểm + Top lĩnh vực */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

              {/* Top địa điểm */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2e7d32]">location_on</span>
                  Top địa điểm tuyển dụng
                </h2>
                {topLocations.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-2.5">
                    {topLocations.map(([name, count], i) => {
                      const pct = totalActive === 0 ? 0 : Math.round((count / totalActive) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-on-surface truncate">{name}</span>
                              <span className="text-[#2e7d32] font-bold ml-2 flex-shrink-0">{count}</span>
                            </div>
                            <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className="h-full bg-[#2e7d32] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Top lĩnh vực */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1565c0]">work</span>
                  Top lĩnh vực tuyển dụng
                </h2>
                {topIndustries.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-2.5">
                    {topIndustries.map(([name, count], i) => {
                      const pct = totalActive === 0 ? 0 : Math.round((count / totalActive) * 100);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-surface-container text-[10px] font-bold text-on-surface-variant flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-medium text-on-surface truncate">{name}</span>
                              <span className="text-[#1565c0] font-bold ml-2 flex-shrink-0">{count}</span>
                            </div>
                            <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className="h-full bg-[#1565c0] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Hàng 4: Công ty đăng tin nhiều nhất + Tổng danh mục */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Top công ty đăng tin */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#6a1b9a]">emoji_events</span>
                  Doanh nghiệp đăng tin nhiều nhất
                </h2>
                {topCompanies.length === 0 ? (
                  <p className="text-sm text-on-surface-variant text-center py-8">Chưa có dữ liệu</p>
                ) : (
                  <div className="space-y-3">
                    {topCompanies.map(([name, count], i) => {
                      const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                      return (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container transition-colors">
                          <span className="text-xl w-8 text-center flex-shrink-0">{medals[i] || i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-on-surface truncate">{name}</p>
                          </div>
                          <span className="text-sm font-extrabold text-[#6a1b9a] flex-shrink-0">{count} tin</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tổng quan danh mục */}
              <div className="bg-white rounded-xl border border-outline-variant shadow-sm p-5">
                <h2 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e65100]">category</span>
                  Tổng quan danh mục hệ thống
                </h2>
                <div className="space-y-3">
                  {[
                    { label: 'Địa điểm', count: raw.locations.length, icon: 'location_on', bg: 'bg-[#e8f5e9]', color: 'text-[#2e7d32]' },
                    { label: 'Lĩnh vực ngành nghề', count: raw.industries.length, icon: 'work', bg: 'bg-[#e3f2fd]', color: 'text-[#1565c0]' },
                    { label: 'Kỹ năng', count: raw.skills.length, icon: 'psychology', bg: 'bg-[#f3e5f5]', color: 'text-[#6a1b9a]' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                      <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-lg flex items-center justify-center`}>
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-on-surface">{item.label}</p>
                      </div>
                      <span className={`text-2xl font-extrabold ${item.color}`}>{item.count}</span>
                    </div>
                  ))}

                  <div className="mt-2 pt-3 border-t border-outline-variant flex justify-between items-center">
                    <span className="text-sm font-semibold text-on-surface">Tổng cộng</span>
                    <span className="text-2xl font-extrabold text-primary">
                      {raw.locations.length + raw.industries.length + raw.skills.length}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AdminStatisticsPage;