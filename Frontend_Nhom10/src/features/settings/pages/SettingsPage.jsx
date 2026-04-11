import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { profileAPI } from '../../../services/api';
import { ensureAuthenticated } from '../../../services/guestAuth';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProfileSidebar from '../../../components/layout/ProfileSidebar';

function SettingsPage() {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Quản lý trạng thái
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    smsNotifications: false
  });

  const [profileVisibility, setProfileVisibility] = useState('hidden');

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      await ensureAuthenticated(); // Đảm bảo token trước khi gọi API
      const response = userRole === 'CANDIDATE'
        ? await profileAPI.getMyCandidateProfile()
        : await profileAPI.getMyCompanyProfile();

      if (response?.data?.result) {
        setProfile(response.data.result);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Trình xử lý sự kiện
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleNotification = (type) => {
    setNotifications(prev => {
      const newValue = !prev[type];
      toast.success(`Đã ${newValue ? 'bật' : 'tắt'} thông báo`);
      return { ...prev, [type]: newValue };
    });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (!profile) {
      toast.error('Không tìm thấy thông tin tài khoản');
      return;
    }

    try {
      setLoading(true);
      toast.info('Đang cập nhật mật khẩu...');

      const changePasswordData = {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const profileId = userRole === 'CANDIDATE'
        ? profile.candidateProfileId
        : profile.companyProfileId;

      const response = userRole === 'CANDIDATE'
        ? await profileAPI.changeCandidatePassword(profileId, changePasswordData)
        : await profileAPI.changeCompanyPassword(profileId, changePasswordData);

      if (response?.data?.code === 1000) {
        toast.success('Đã cập nhật mật khẩu thành công');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      const errorMessage = err.response?.data?.message || 'Không thể thay đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShowProfile = () => {
    if (profileVisibility === 'visible') {
      setProfileVisibility('hidden');
      toast.success('Hồ sơ đã được ẩn');
    } else {
      setProfileVisibility('visible');
      toast.success('Hồ sơ đã được hiển thị công khai');
    }
  };

  const handlePreviewProfile = () => {
    toast.info('Chức năng xem trước đang phát triển');
  };

  const handleDownloadData = () => {
    toast.info('Đang chuẩn bị tải xuống dữ liệu...');
  };

  const handleConnectGitHub = () => {
    toast.info('Chức năng kết nối GitHub đang phát triển');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <style>
        {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}
      </style>

      {/* Header */}
      <Header />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <ProfileSidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-4xl mx-auto">
        <header className="mb-16">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] text-secondary uppercase mb-2 block">
            BẢO MẬT &amp; TÀI KHOẢN
          </span>
          <h1 className="text-[3.5rem] font-extrabold leading-none tracking-tighter text-primary mb-4">
            Cài đặt tài khoản
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Cập nhật mật khẩu và quản lý các tùy chọn bảo mật để bảo vệ sự hiện diện chuyên nghiệp của bạn
            trên JobMatch.
          </p>
        </header>

        <div className="space-y-24">
          {/* Section 1: Đổi mật khẩu */}
          <section className="relative" id="password-section">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <h3 className="text-2xl font-bold text-primary mb-2">Đổi mật khẩu</h3>
                <p className="text-on-surface-variant text-sm">
                  Đảm bảo tài khoản của bạn sử dụng mật khẩu dài, ngẫu nhiên để luôn an toàn.
                </p>
              </div>
              <div className="lg:w-2/3 bg-white border border-outline-variant p-10 rounded-xl shadow-sm">
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-primary">Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-primary">Mật khẩu mới</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-primary">Xác nhận mật khẩu</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="••••••••"
                        className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-secondary text-on-secondary px-8 py-3 rounded-md font-semibold text-sm hover:bg-on-secondary-container transition-all active:scale-95"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* Section 2: Quản lý thông báo */}
          <section id="notifications-section">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <h3 className="text-2xl font-bold text-primary mb-2">Quản lý thông báo</h3>
                <p className="text-on-surface-variant text-sm">
                  Quyết định cách bạn muốn nhận thông tin về các cơ hội mới và cập nhật mạng lưới.
                </p>
              </div>
              <div className="lg:w-2/3 space-y-4">
                {/* Toggle Card 1 - Email alerts */}
                <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-xl transition-all duration-300 hover:bg-surface-container-high">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">mail</span>
                    </div>
                    <div>
                      <p className="font-bold text-primary">Email alerts</p>
                      <p className="text-xs text-on-surface-variant">Nhận thông báo việc làm và tin tức qua email hàng ngày.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('emailAlerts')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ring-2 ring-transparent ring-offset-2 ${
                      notifications.emailAlerts ? 'bg-secondary' : 'bg-surface-variant'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.emailAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                {/* Toggle Card 2 - Push notifications */}
                <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-xl transition-all duration-300 hover:bg-surface-container-high">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">notifications_active</span>
                    </div>
                    <div>
                      <p className="font-bold text-primary">Push notifications</p>
                      <p className="text-xs text-on-surface-variant">
                        Thông báo trực tiếp trên trình duyệt hoặc thiết bị di động.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('pushNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ring-2 ring-transparent ring-offset-2 ${
                      notifications.pushNotifications ? 'bg-secondary' : 'bg-surface-variant'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.pushNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>

                {/* Toggle Card 3 - SMS notifications */}
                <div className="flex items-center justify-between p-6 bg-surface-container-low rounded-xl transition-all duration-300 hover:bg-surface-container-high">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">sms</span>
                    </div>
                    <div>
                      <p className="font-bold text-primary">SMS notifications</p>
                      <p className="text-xs text-on-surface-variant">Tin nhắn văn bản cho các cuộc phỏng vấn khẩn cấp.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('smsNotifications')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                      notifications.smsNotifications ? 'bg-secondary' : 'bg-surface-variant'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Quyền riêng tư */}
          <section id="privacy-section">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <h3 className="text-2xl font-bold text-primary mb-2">Quyền riêng tư</h3>
                <p className="text-on-surface-variant text-sm">
                  Kiểm soát khả năng hiển thị của hồ sơ đối với các nhà tuyển dụng hàng đầu.
                </p>
              </div>
              <div className="lg:w-2/3">
                <div className="bg-primary-container p-8 rounded-xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xl font-bold">Trạng thái hiển thị hồ sơ</h4>
                      <span className="px-3 py-1 bg-secondary text-[10px] font-bold tracking-widest uppercase rounded-full">
                        Hiện tại: {profileVisibility === 'visible' ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </div>
                    <p className="text-on-primary-container mb-8 leading-relaxed">
                      Khi được bật, hồ sơ của bạn sẽ hiển thị trong kết quả tìm kiếm của các nhà tuyển dụng đã được xác
                      minh. Các thông tin nhạy cảm vẫn sẽ được bảo mật.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleShowProfile}
                        className="bg-white text-primary px-6 py-2 rounded-md font-bold text-sm hover:bg-primary-fixed transition-colors"
                      >
                        {profileVisibility === 'visible' ? 'Ẩn hồ sơ' : 'Hiển thị hồ sơ'}
                      </button>
                      <button
                        onClick={handlePreviewProfile}
                        className="border border-on-primary-container text-on-primary-container px-6 py-2 rounded-md font-bold text-sm hover:text-white hover:border-white transition-colors"
                      >
                        Xem trước hồ sơ
                      </button>
                    </div>
                  </div>
                  {/* Subtle Background Texture */}
                  <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Tài khoản liên kết */}
          <section id="linked-accounts">
            <div className="flex flex-col lg:flex-row gap-12">
              <div className="lg:w-1/3">
                <h3 className="text-2xl font-bold text-primary mb-2">Tài khoản liên kết</h3>
                <p className="text-on-surface-variant text-sm">Kết nối các mạng lưới nghề nghiệp của bạn.</p>
              </div>
              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-outline-variant/30 rounded-lg flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded">
                      <span className="material-symbols-outlined">link</span>
                    </div>
                    <span className="font-medium">LinkedIn</span>
                  </div>
                  <span className="text-xs text-secondary font-bold">ĐÃ LIÊN KẾT</span>
                </div>
                <div className="p-6 bg-white border border-outline-variant/30 rounded-lg flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-900 rounded">
                      <span className="material-symbols-outlined">code</span>
                    </div>
                    <span className="font-medium">GitHub</span>
                  </div>
                  <button
                    onClick={handleConnectGitHub}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    KẾT NỐI
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default SettingsPage;
