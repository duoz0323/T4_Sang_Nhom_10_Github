import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, User, AlertCircle } from 'lucide-react';
import BusinessHeroBackground from '../components/BusinessHeroBackground';
import authService from '../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Try both candidate and company login
      const [candidateResult, companyResult] = await Promise.allSettled([
        authService.loginCandidate(formData.email, formData.password),
        authService.loginCompany(formData.email, formData.password)
      ]);
      
      // Check which one succeeded
      let result = null;
      
      if (candidateResult.status === 'fulfilled' && candidateResult.value.success) {
        result = candidateResult.value;
      } else if (companyResult.status === 'fulfilled' && companyResult.value.success) {
        result = companyResult.value;
      }
      
      if (result) {
        // Wait a bit for localStorage to be updated
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get user from localStorage to check role
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        console.log('✅ Login successful! User:', user);
        
        // Redirect based on role
        if (user?.role === 'ADMIN') {
          window.location.href = '/users'; // Admin dashboard
        } else if (user?.role === 'COMPANY') {
          window.location.href = '/company/dashboard'; // Company dashboard
        } else {
          window.location.href = '/'; // Applicant homepage
        }
      } else {
        setError('Email hoặc mật khẩu không đúng');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white order-2 lg:order-1 h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JobMatch</h1>
          </div>

          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Tiếp tục hành trình chinh phục những nấc thang sự nghiệp danh giá cùng JobMatch.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                EMAIL
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
                  MẬT KHẨU
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 transition duration-200"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white pr-12 transition duration-200 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6 sm:mt-8">
            <div className="text-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 font-medium">
              HOẶC ĐĂNG NHẬP BẰNG
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs sm:text-sm">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm sm:text-base">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="#0077B5" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-xs sm:text-sm">LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Register Link */}
          <p className="text-center mt-6 sm:mt-8 text-sm sm:text-base text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium transition duration-200">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden order-1 lg:order-2">
        <BusinessHeroBackground />

        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full flex flex-col p-8">
          {/* Top Badge - TOP LEFT */}
          <div className="mb-auto">
            <span className="text-sm font-semibold tracking-widest text-teal-400 uppercase">
              Executive Intelligence
            </span>
          </div>

          {/* Main Content - CENTER */}
          <div className="flex flex-col items-center text-center mb-auto">
            {/* Quote */}
            <h2 className="text-3xl font-bold text-white leading-snug mb-8 max-w-md">
              "Kết nối tầm nhìn vĩ đại với những tài năng xuất chúng nhất."
            </h2>

            {/* User Stats */}
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center overflow-hidden">
                  <User size={14} className="text-slate-300" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-600 border-2 border-slate-500 flex items-center justify-center overflow-hidden">
                  <User size={14} className="text-slate-300" />
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-700 border-2 border-slate-500 flex items-center justify-center text-xs text-slate-300">
                  +
                </div>
              </div>
              <span className="text-sm text-white/70">Được tin dùng bởi hơn 500 tập đoàn hàng đầu toàn cầu.</span>
            </div>
          </div>

          {/* Bottom Card - Glass Effect */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Xu hướng Thị trường</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Nhận báo cáo định kỳ về mức lương và nhu cầu nhân sự cấp cao tại thị trường Việt Nam năm 2024.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;