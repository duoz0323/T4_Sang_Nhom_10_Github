import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

function AdminSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const menuItems = [
    { path: '/admin/dashboard', icon: 'dashboard', label: 'Tổng quan' },
    { path: '/users', icon: 'group', label: 'Quản lý người dùng' },
    { path: '/admin/companies', icon: 'business', label: 'Quản lý doanh nghiệp' },
    { path: '/admin/pending-posts', icon: 'pending_actions', label: 'Kiểm duyệt tin' },
    { path: '/admin/categories', icon: 'category',  label: 'Quản lý danh mục' },
    { path: '/admin/statistics', icon: 'bar_chart', label: 'Thống kê hệ thống' },
    { path: '/admin/posts', icon: 'article', label: 'Bài viết và blog' },
    { path: '/admin/activity-log', icon: 'history', label: 'Nhật ký hoạt động' }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-primary-container text-white min-h-screen sticky top-20 transition-all duration-300`}>
      {/* Admin Header with Collapse Button */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-bold mb-1">Admin Panel</h2>
            <p className="text-xs text-white/70">Hệ thống quản trị</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-white/10 rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <span className="material-symbols-outlined text-white/80">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* Menu */}
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-secondary text-white font-semibold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className="material-symbols-outlined text-xl">
                  {item.icon}
                </span>
                {!isCollapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
