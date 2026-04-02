import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function ProfileSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isApplicant, isCompany } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Menu items based on role
  const applicantMenuItems = [
    { path: '/profile', icon: 'person', label: 'Hồ sơ cá nhân' },
    { path: '/my-jobs', icon: 'work', label: 'Việc làm của tôi' },
    { path: '/cv-portfolio', icon: 'description', label: 'CV & Portfolio' },
    { path: '/settings', icon: 'settings', label: 'Cài đặt' }
  ];

  const companyMenuItems = [
    { path: '/company/profile', icon: 'business', label: 'Hồ sơ công ty' },
    { path: '/company/settings', icon: 'settings', label: 'Cài đặt' }
  ];

  const menuItems = isCompany ? companyMenuItems : applicantMenuItems;
  const backPath = isCompany ? '/company/dashboard' : '/';

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-outline-variant min-h-screen sticky top-20 transition-all duration-300`}>
      {/* Header with Collapse Button */}
      <div className="p-4 border-b border-outline-variant flex items-center justify-between">
        {!isCollapsed && (
          <button 
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-primary hover:text-secondary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="text-sm font-semibold">Quay lại</span>
          </button>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-surface-container rounded-lg transition-colors ml-auto"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            {isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-on-surface truncate">{user?.name || user?.companyName || 'User'}</h3>
              <p className="text-xs text-on-surface-variant">
                {isCompany ? 'Doanh nghiệp' : (user?.position || 'Ứng viên')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Avatar */}
      {isCollapsed && (
        <div className="p-4 border-b border-outline-variant flex justify-center">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            )}
          </div>
        </div>
      )}

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

export default ProfileSidebar;
