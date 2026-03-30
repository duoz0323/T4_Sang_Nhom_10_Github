import { useState } from 'react';
import { Link } from 'react-router';
import { LogOut, User, Briefcase, Bell } from 'lucide-react';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-teal-600">JobMatch</h1>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/jobs" className="text-gray-600 hover:text-gray-900 font-medium">Việc làm</Link>
                <Link to="/companies" className="text-gray-600 hover:text-gray-900 font-medium">Công ty</Link>
                <Link to="/profile" className="text-gray-600 hover:text-gray-900 font-medium">Hồ sơ</Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-teal-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Nguyễn Văn A</span>
              </div>
              
              <Link
                to="/login"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium ml-4"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan về hoạt động của bạn.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">Đơn ứng tuyển</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <User size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-600">Phỏng vấn</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Bell size={24} className="text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-600">Thông báo mới</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Ứng tuyển vị trí Frontend Developer tại Công ty ABC</p>
                  <p className="text-xs text-gray-500">2 giờ trước</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nhận được lời mời phỏng vấn từ Công ty XYZ</p>
                  <p className="text-xs text-gray-500">1 ngày trước</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cập nhật hồ sơ cá nhân</p>
                  <p className="text-xs text-gray-500">3 ngày trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/jobs"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition duration-200"
            >
              <Briefcase size={24} className="text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Tìm việc làm</span>
            </Link>
            
            <Link
              to="/profile"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition duration-200"
            >
              <User size={24} className="text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Cập nhật hồ sơ</span>
            </Link>
            
            <Link
              to="/applications"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition duration-200"
            >
              <Bell size={24} className="text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Xem đơn ứng tuyển</span>
            </Link>
            
            <Link
              to="/saved-jobs"
              className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition duration-200"
            >
              <Briefcase size={24} className="text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700">Việc đã lưu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;