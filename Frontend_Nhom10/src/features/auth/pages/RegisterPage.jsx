import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, User, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import BusinessHeroBackground from '../components/BusinessHeroBackground';
import authService from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    address: '',
    email: '',
    phoneNumber: '',
    birthday: '',
    password: '',
    confirmPassword: '',
    agreesToTerms: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }
    if (!formData.agreesToTerms) {
      setError('Vui lòng đồng ý với điều khoản sử dụng');
      return;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (activeTab === 'candidate') {
        // Register as Candidate
        const candidateData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          birthday: formData.birthday
        };
        result = await authService.registerCandidate(candidateData);
      } else {
        // Register as Company
        const companyData = {
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          address: formData.address
        };
        result = await authService.registerCompany(companyData);
      }
      
      if (result.success) {
        setSuccess(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess(false);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left Side - Hero - Hidden on mobile, shown on lg+ */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden order-2 lg:order-1">
        <BusinessHeroBackground />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full w-full flex flex-col p-6 xl:p-8">
          {/* Top Badge - TOP LEFT */}
          <div className="mb-auto">
            <span className="text-sm font-semibold tracking-widest text-teal-400 uppercase">
              JobMatch Platform
            </span>
          </div>

          {/* Main Content - CENTER */}
          <div className="flex flex-col items-center text-center mb-auto">
            {/* Title - NO ITALIC */}
            <h1 className="text-3xl font-bold text-white leading-snug mb-4">
              Kiến tạo<br />
              Sự nghiệp<br />
              Đẳng cấp.
            </h1>

            {/* Description */}
            <p className="text-sm text-white/70 leading-relaxed mb-8 max-w-sm">
              Tham gia mạng lưới tuyển dụng cấp cao dành cho chuyên gia và lãnh đạo doanh nghiệp.
            </p>

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
              <span className="text-sm text-white/70">+2,600 lãnh đạo đã tham gia</span>
            </div>
          </div>

          {/* Bottom Card - Glass Effect */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-white mb-1">Cơ hội Nghề nghiệp</p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Khám phá các vị trí lãnh đạo cao cấp và cơ hội phát triển sự nghiệp tại các tập đoàn hàng đầu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white order-1 lg:order-2 h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 lg:p-8 pb-2 shrink-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JobMatch</h1>
        </div>

        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-1 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">{/* Title */}
            <div className="mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">Tạo tài khoản mới</h2>
              <p className="text-sm text-gray-600">
                Bắt đầu hành trình chinh phục những nấc thang sự nghiệp danh giá cùng JobMatch.
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-green-600">Đăng ký thành công! Đang chuyển đến trang đăng nhập...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Role Selection Tabs */}
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1.5">BẠN LÀ AI?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('candidate')}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-colors ${
                    activeTab === 'candidate'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <User size={18} />
                  <span className="text-sm font-medium">Ứng viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('company')}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border-2 transition-colors ${
                    activeTab === 'company'
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Building2 size={18} />
                  <span className="text-sm font-medium">Nhà tuyển dụng</span>
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">{/* Candidate Fields */}
              {activeTab === 'candidate' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      HỌ VÀ TÊN
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Birthday */}
                  <div>
                    <label htmlFor="birthday" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      NGÀY SINH
                    </label>
                    <input
                      type="date"
                      id="birthday"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Company Fields */}
              {activeTab === 'company' && (
                <>
                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      TÊN CÔNG TY
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Công ty ABC"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      ĐỊA CHỈ
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="123 Đường ABC, Quận 1"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}

              {/* Email - Common Field */}
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@gmail.com"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition duration-200 text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  MẬT KHẨU
                </label>
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

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  XÁC NHẬN MẬT KHẨU
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white pr-12 transition duration-200 text-sm sm:text-base"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-200"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="agreesToTerms"
                  name="agreesToTerms"
                  checked={formData.agreesToTerms}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 transition duration-200"
                  required
                  disabled={isLoading}
                />
                <label htmlFor="agreesToTerms" className="text-xs sm:text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-teal-600 hover:text-teal-700 transition duration-200">
                    Điều khoản dịch vụ
                  </Link>
                  {' '}và{' '}
                  <Link to="/privacy" className="text-teal-600 hover:text-teal-700 transition duration-200">
                    Chính sách bảo mật
                  </Link>
                  {' '}của JobMatch.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-5">
              <div className="text-center text-xs sm:text-sm text-gray-500 mb-3 font-medium">
                HOẶC ĐĂNG KÝ BẰNG
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm sm:text-base">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 font-medium text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="#0077B5" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-sm sm:text-base">LinkedIn</span>
                </button>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center mt-4 text-sm sm:text-base text-gray-600 pb-2">
              Đã có tài khoản?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium transition duration-200">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;