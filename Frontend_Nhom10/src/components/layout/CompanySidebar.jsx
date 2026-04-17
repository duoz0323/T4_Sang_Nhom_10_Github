import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function CompanySidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const menuItems = [
    { path: '/company/dashboard', icon: 'dashboard', label: 'Bảng điều khiển' },
    { path: '/company/create-job', icon: 'add_circle', label: 'Đăng tin tuyển' }, 
    { path: '/company/manage-jobs', icon: 'list_alt', label: 'Quản lý tin đăng' },
    { path: '/company/candidates', icon: 'group', label: 'Quản lý ứng viên' },  
    { path: '/company/profile', icon: 'business', label: 'Hồ sơ công ty' },
    { path: '/company/settings', icon: 'settings', label: 'Cài đặt' }
  ];

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-outline-variant min-h-screen sticky top-20 transition-all duration-300`}>
      {/* Company Header with Collapse Button */}
      <div className="p-6 border-b border-outline-variant flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-xl font-bold text-primary mb-1">Doanh nghiệp</h2>
            <p className="text-xs text-on-surface-variant">Quản lý tuyển dụng</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-surface-container rounded-lg transition-colors ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <span className="material-symbols-outlined text-on-surface-variant">
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
                    ? 'bg-secondary-container text-secondary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container'
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

export default CompanySidebar;
