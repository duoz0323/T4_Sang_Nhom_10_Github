import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import CompanySidebar from '../../../components/layout/CompanySidebar';

function CompanyDashboard() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <Header />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <CompanySidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Bảng điều khiển</h1>
              <p className="text-on-surface-variant">Chào mừng, {user?.name || user?.companyName}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">work</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Tin tuyển dụng</p>
                    <p className="text-2xl font-bold text-primary">12</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">group</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Ứng viên</p>
                    <p className="text-2xl font-bold text-primary">248</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-tertiary-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">visibility</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Lượt xem</p>
                    <p className="text-2xl font-bold text-primary">3,421</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">schedule</span>
                  </div>
                  <div>
                    <p className="text-sm text-on-surface-variant">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-primary">5</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm mb-8">
              <h2 className="text-xl font-bold text-primary mb-4">Thao tác nhanh</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to="/company/post-job"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary">add_circle</span>
                  <span className="font-medium">Đăng tin tuyển dụng</span>
                </Link>
                <Link
                  to="/company/applicants"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary">person_search</span>
                  <span className="font-medium">Xem ứng viên</span>
                </Link>
                <Link
                  to="/company/profile"
                  className="flex items-center gap-3 p-4 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-secondary">business</span>
                  <span className="font-medium">Cập nhật hồ sơ</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <h2 className="text-xl font-bold text-primary mb-4">Hoạt động gần đây</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-secondary">person_add</span>
                  <div className="flex-1">
                    <p className="font-medium">Ứng viên mới ứng tuyển</p>
                    <p className="text-sm text-on-surface-variant">Nguyễn Minh Anh ứng tuyển vị trí Senior Developer</p>
                    <p className="text-xs text-on-surface-variant mt-1">5 phút trước</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-surface-container-low">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  <div className="flex-1">
                    <p className="font-medium">Tin tuyển dụng đã được duyệt</p>
                    <p className="text-sm text-on-surface-variant">Product Manager - Đã được phê duyệt</p>
                    <p className="text-xs text-on-surface-variant mt-1">2 giờ trước</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CompanyDashboard;
