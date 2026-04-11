import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';

const AdminDashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {/* Header */}
      <Header />

      {/* Content with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">👋 Xin chào {user?.fullName || 'Quản trị viên'}</h1>
              <p className="text-on-surface-variant">Chào mừng bạn đến với trang quản trị hệ thống.</p>
            </div>

            {/* Content Area */}
            <div className="bg-white p-12 rounded-xl border border-outline-variant shadow-sm text-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">settings_suggest</span>
              <h2 className="text-2xl font-bold text-on-surface mb-2">Bảng điều khiển Quản trị viên</h2>
              <p className="text-on-surface-variant max-w-lg mx-auto">
                Khu vực này hiện đang trong quá trình phát triển cho dự án thực tế. 
                Bạn có thể thêm các tính năng quản lý tài khoản, quản lý bản tin, và báo cáo tại đây.
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;
