import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { getUserType } from '../../utils/jwtUtils';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      setUserType(getUserType(token));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiration');
    setIsLoggedIn(false);
    setUserType(null);
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              The Executive Lens
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium border-b-2 border-teal-600 pb-1"
            >
              Cơ hội việc làm
            </Link>

            {userType === 'COMPANY' && (
              <Link
                to="/company/jobs"
                className="text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium"
              >
                Danh cho nhà tuyển dụng
              </Link>
            )}

            {userType === 'ADMIN' && (
              <Link
                to="/admin/pending-jobs"
                className="text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium"
              >
                Duyệt tin tuyển dụng
              </Link>
            )}

            <Link
              to="/about"
              className="text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Về chúng tôi
            </Link>
            <Link
              to="/contact"
              className="text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium"
            >
              Liên hệ
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-gray-600 font-medium">
                  {userType === 'ADMIN' && 'Admin'}
                  {userType === 'COMPANY' && 'Doanh nghiệp'}
                  {userType === 'CANDIDATE' && 'Ứng viên'}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  Đăng xuất
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
