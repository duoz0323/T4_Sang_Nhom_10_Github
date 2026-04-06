import { useState } from 'react';
import { toast } from 'sonner';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import CompanySidebar from '../../../components/layout/CompanySidebar';

function CompanySettingsPage() {
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

  const [profileVisibility, setProfileVisibility] = useState('public');

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

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    toast.success('Đã đổi mật khẩu thành công!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleVisibilityChange = (value) => {
    setProfileVisibility(value);
    toast.success(`Đã đổi chế độ hiển thị thành ${value === 'public' ? 'Công khai' : 'Riêng tư'}`);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      toast.error('Tính năng đang phát triển');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <style>
        {`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
          .toggle-checkbox:checked {
            background-color: var(--md-sys-color-secondary);
            border-color: var(--md-sys-color-secondary);
          }
          .toggle-checkbox:checked + .toggle-switch {
            transform: translateX(100%);
          }
        `}
      </style>

      {/* Tiêu đề */}
      <Header />

      {/* Nội dung chính với thanh bên */}
      <div className="flex flex-1 pt-16">
        {/* Thanh bên */}
        <CompanySidebar />

        {/* Vùng nội dung chính */}
        <main className="flex-1 p-8 bg-surface">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Tiêu đề trang */}
            <div>
              <h1 className="text-3xl font-manrope font-extrabold text-primary">Cài đặt</h1>
              <p className="text-on-surface-variant mt-2">Quản lý tài khoản và cài đặt bảo mật của bạn</p>
            </div>

            {/* Phần đổi mật khẩu */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">lock</span>
                </div>
                <div>
                  <h2 className="text-xl font-manrope font-bold text-primary">Đổi mật khẩu</h2>
                  <p className="text-sm text-on-surface-variant">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-primary">Mật khẩu hiện tại</label>
                    <input 
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-primary">Mật khẩu mới</label>
                      <input 
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-primary">Xác nhận mật khẩu</label>
                      <input 
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" 
                        placeholder="••••••••" 
                        type="password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="submit" 
                      className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <span>Cập nhật mật khẩu</span>
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Phần thông báo */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-2xl">notifications</span>
                </div>
                <div>
                  <h2 className="text-xl font-manrope font-bold text-primary">Thông báo</h2>
                  <p className="text-sm text-on-surface-variant">Quản lý các loại thông báo bạn nhận được</p>
                </div>
              </div>
              <div className="space-y-6">
                {/* Cảnh báo Email */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">email</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Thông báo Email</p>
                      <p className="text-xs text-on-surface-variant">Nhận thông báo qua email</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('emailAlerts')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications.emailAlerts ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.emailAlerts ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Thông báo Push */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-secondary">notifications_active</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Thông báo Push</p>
                      <p className="text-xs text-on-surface-variant">Nhận thông báo trên trình duyệt</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('pushNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications.pushNotifications ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.pushNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Thông báo SMS */}
                <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-tertiary-container rounded-lg flex items-center justify-center">
                      <span className="material-symbols-outlined text-tertiary">sms</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">Thông báo SMS</p>
                      <p className="text-xs text-on-surface-variant">Nhận thông báo qua tin nhắn</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification('smsNotifications')}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      notifications.smsNotifications ? 'bg-secondary' : 'bg-outline-variant'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications.smsNotifications ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Phần quyền riêng tư */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-error text-2xl">visibility</span>
                </div>
                <div>
                  <h2 className="text-xl font-manrope font-bold text-primary">Quyền riêng tư</h2>
                  <p className="text-sm text-on-surface-variant">Kiểm soát ai có thể xem hồ sơ công ty của bạn</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="flex items-center p-4 bg-surface rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={profileVisibility === 'public'}
                    onChange={(e) => handleVisibilityChange(e.target.value)}
                    className="w-5 h-5 text-secondary focus:ring-2 focus:ring-secondary"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-on-surface">Công khai</p>
                    <p className="text-xs text-on-surface-variant">Mọi người có thể xem hồ sơ công ty của bạn</p>
                  </div>
                </label>
                <label className="flex items-center p-4 bg-surface rounded-lg cursor-pointer hover:bg-surface-container transition-colors">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={profileVisibility === 'private'}
                    onChange={(e) => handleVisibilityChange(e.target.value)}
                    className="w-5 h-5 text-secondary focus:ring-2 focus:ring-secondary"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-on-surface">Riêng tư</p>
                    <p className="text-xs text-on-surface-variant">Chỉ bạn có thể xem hồ sơ của mình</p>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Chân trang */}
      <Footer />
    </div>
  );
}

export default CompanySettingsPage;
