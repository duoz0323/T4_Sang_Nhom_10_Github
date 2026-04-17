import { createContext, useContext, useState, useEffect } from 'react';

// Khởi tạo ngữ cảnh xác thực (Auth Context) để quản lý trạng thái đăng nhập toàn cục
const AuthContext = createContext();

// Custom hook để sử dụng AuthContext dễ dàng hơn ở các component khác
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Trả về lỗi bằng tiếng Việt nếu dùng ngoài phạm vi AuthProvider
    throw new Error('Hàm useAuth phải được sử dụng bên trong component AuthProvider');        
  }
  return context;
};

// Component cung cấp AuthContext cho toàn bộ ứng dụng
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Lưu thông tin người dùng
  const [loading, setLoading] = useState(true); // Trạng thái đang tải thông tin

  // Hook khởi chạy lần đầu tiên: Đọc thông tin người dùng từ LocalStorage (bộ nhớ trình duyệt)
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (storedUser) {
      const userData = JSON.parse(storedUser);

      // Cấp phát quyền (role) tương ứng dựa trên 'userType' đã lưu
      if (userType === 'admin') {
        userData.role = 'ADMIN';
      } else if (userType === 'candidate') {
        userData.role = 'APPLICANT';
      } else if (userType === 'company') {
        userData.role = 'COMPANY';
      }

      setUser(userData); // Cập nhật state với thông tin vừa lấy được
    }
    // Gắn nhãn tải hoàn tất để bắt đầu hiển thị giao diện
    setLoading(false);
  }, []);

  // Hàm xử lý đăng nhập - Cập nhật người dùng mới vào State và LocalStorage
  const login = (userData) => {
    const userType = localStorage.getItem('userType');
    
    // Đảm bảo thông tin người dùng có thuộc tính phân quyền (role)
    if (!userData.role && userType) {
      if (userType === 'admin') userData.role = 'ADMIN';
      else if (userType === 'candidate') userData.role = 'APPLICANT';
      else if (userType === 'company') userData.role = 'COMPANY';
    }

    setUser(userData); // Cập nhật state quản lý ngay lập tức
    localStorage.setItem('user', JSON.stringify(userData)); // Lưu lại cho những lần tải trang sau
  };

  // Hàm xử lý đăng xuất - Xóa sách dữ liệu phiên bản ở context và LocalStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userType');
    localStorage.clear(); // Xóa sạch bộ nhớ tạm
  };

  // Trả về đường dẫn Trang Chủ mặc định tùy theo vai trò (Role)
  const getHomePath = () => {
    if (!user) return '/'; // Người dùng khách
    if (user.role === 'ADMIN') return '/admin/dashboard'; // Quản trị viên
    if (user.role === 'COMPANY') return '/company/dashboard'; // Công ty / Nhà tuyển dụng
    return '/'; // Ứng viên (APPLICANT)
  };

  // Tổng hợp tất cả hàm xử lý và state cấp phát cho ứng dụng sử dụng
  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user, // Kiểm tra đã đăng nhập chưa
    isApplicant: user?.role === 'APPLICANT', // Phải là ứng viên hay không
    isCompany: user?.role === 'COMPANY', // Phải là công ty hay không
    isAdmin: user?.role === 'ADMIN', // Phải là quản trị viên hay không
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
