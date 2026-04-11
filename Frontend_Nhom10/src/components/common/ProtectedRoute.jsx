import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Bảo vệ routes dựa trên authentication và role
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Đợi load xong
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Chưa đăng nhập → redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu role cụ thể
  if (requiredRole) {
    // Kiểm tra quyền truy cập (theo nhóm hoặc theo một quyền)
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user?.role)) {
      // Không đủ quyền → redirect về trang home của role đó
      if (user?.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user?.role === 'COMPANY') {
        return <Navigate to="/company/dashboard" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // OK - render children
  return children;
};

export default ProtectedRoute;
