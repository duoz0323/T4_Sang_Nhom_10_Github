import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated, isApplicant, isCompany, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi bấm bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  // Xác định đường dẫn trang chủ dựa trên vai trò người dùng
  const getHomePath = () => {
    if (!isAuthenticated) return '/';
    if (isAdmin) return '/admin/dashboard';
    if (isCompany) return '/company/dashboard';
    return '/'; // Applicant
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-outline-variant shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
        {/* Logo */}
        <Link to={getHomePath()} className="hover:opacity-80 transition-opacity">
          <img 
            src="/images/logo.png" 
            alt="TalentLink Logo" 
            className="h-20 w-auto object-contain"
          />
        </Link>

        {/* Mobile Menu Button - Left aligned on mobile */}
        {(!isAuthenticated || isApplicant) && (
          <button 
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors ml-4"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <span className="material-symbols-outlined text-2xl">
              {showMobileMenu ? 'close' : 'menu'}
            </span>
          </button>
        )}

        {/* Menu điều hướng - Hiển thị menu dọc cho mobile, menu ngang cho desktop */}
        {(!isAuthenticated || isApplicant) && (
            <nav className={`${showMobileMenu ? 'flex flex-col' : 'hidden'} absolute top-[72px] right-4 left-4 z-50 bg-white rounded-2xl shadow-2xl border border-outline-variant py-2 px-2 md:static md:bg-transparent md:border-none md:shadow-none md:flex-row md:flex md:flex-1 md:justify-center md:py-0 md:px-0 md:gap-8`}>
            <Link
              to="/"
              className={`block w-full py-3 px-4 rounded-xl text-left md:inline-block md:w-auto md:p-0 md:rounded-none md:text-center font-medium transition-colors pb-1 ${
                isActive('/')
                  ? 'bg-primary/10 text-primary md:bg-transparent md:text-on-surface md:border-b-2 md:border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container md:hover:bg-transparent hover:text-primary'
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/jobs"
              className={`block w-full py-3 px-4 rounded-xl text-left md:inline-block md:w-auto md:p-0 md:rounded-none md:text-center font-medium transition-colors pb-1 ${
                isActive('/jobs')
                  ? 'bg-primary/10 text-primary md:bg-transparent md:text-on-surface md:border-b-2 md:border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container md:hover:bg-transparent hover:text-primary'
              }`}
            >
              Tìm việc làm
            </Link>
            <Link
              to="/companies"
              className={`block w-full py-3 px-4 rounded-xl text-left md:inline-block md:w-auto md:p-0 md:rounded-none md:text-center font-medium transition-colors pb-1 ${
                isActive('/companies')
                  ? 'bg-primary/10 text-primary md:bg-transparent md:text-on-surface md:border-b-2 md:border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container md:hover:bg-transparent hover:text-primary'
              }`}
            >
              Công ty
            </Link>
            <Link
              to="/blog"
              className={`block w-full py-3 px-4 rounded-xl text-left md:inline-block md:w-auto md:p-0 md:rounded-none md:text-center font-medium transition-colors pb-1 ${
                isActive('/blog')
                  ? 'bg-primary/10 text-primary md:bg-transparent md:text-on-surface md:border-b-2 md:border-secondary'
                  : 'text-on-surface-variant hover:bg-surface-container md:hover:bg-transparent hover:text-primary'
              }`}
            >
              Blog
            </Link>
          </nav>
          )}

        {/* Admin Navigation */}
        {isAdmin && (
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <Link 
              to="/admin/dashboard" 
              className={`font-medium transition-colors pb-1 ${
                isActive('/admin/dashboard') || isActive('/users')
                  ? 'text-on-surface border-b-2 border-secondary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
            
            </Link>
          </nav>
        )}

        {/* Bên phải: Thông báo + Đăng nhập/Avatar - luôn ở bên phải */}
        <div className="flex items-center gap-4 ml-auto">
          {isAuthenticated && (
            <>
              {/* Thông báo */}
              <button className="relative p-2 hover:bg-surface-container rounded-lg transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">
                  notifications
                </span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </>
          )}

          {isAuthenticated ? (
            /* Dropdown Avatar người dùng */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user?.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </button>

              {/* Menu dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-outline-variant overflow-hidden">
                  {/* Thông tin người dùng */}
                  <div className="p-4 border-b border-outline-variant">
                    <p className="font-bold text-on-surface">{user?.name}</p>
                    <p className="text-sm text-on-surface-variant">{user?.email}</p>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold">
                        {user?.role === 'APPLICANT' && 'Ứng viên'}
                        {user?.role === 'COMPANY' && 'Doanh nghiệp'}
                        {user?.role === 'ADMIN' && 'Quản trị viên'}
                      </span>
                    </div>
                  </div>

                  {/* Các mục menu */}
                  <div className="py-2">
                    {user?.role === 'APPLICANT' && (
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">person</span>
                        <span className="text-sm font-medium">Trang cá nhân</span>
                      </Link>
                    )}
                    {user?.role === 'COMPANY' && (
                      <Link
                        to="/company/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant">business</span>
                        <span className="text-sm font-medium">Hồ sơ công ty</span>
                      </Link>
                    )}
                    <Link
                      to={user?.role === 'COMPANY' ? '/company/settings' : '/settings'}
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                    >
                      <span className="material-symbols-outlined text-on-surface-variant">settings</span>
                      <span className="text-sm font-medium">Cài đặt</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-error"
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span className="text-sm font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Nút đăng nhập */
            <Link
              to="/login"
              className="bg-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-on-secondary-container transition-colors"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
