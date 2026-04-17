import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { profileAPI } from '../../../services/api';
import { ensureAuthenticated } from '../../../services/guestAuth';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import CompanySidebar from '../../../components/layout/CompanySidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

function CompanyProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
    address: '',
    taxCode: ''
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      await ensureAuthenticated(); // Ensure token before API call

      const response = await profileAPI.getMyCompanyProfile();

      if (response?.data?.result) {
        const profileData = response.data.result;

        setProfile(profileData);
        setFormData({
          companyName: profileData.companyName || '',
          email: profileData.email || '',
          phone: profileData.phoneNumber || '',
          address: profileData.address || '',
          taxCode: profileData.tax || ''
        });

        // Update global AuthContext user if avatar or companyName changed
        if (user && (profileData.avatar !== user.avatar || profileData.companyName !== user.name)) {
          login({
            ...user,
            avatar: profileData.avatar || user.avatar,
            name: profileData.companyName || user.name
          });
        }
      } else {
        console.warn('No company profile data');
      }
    } catch (err) {
      console.error('Error fetching company profile:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Không thể tải hồ sơ công ty');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { 
      toast.error('Logo không được vượt quá 5MB'); 
      return;
    }
    if (!file.type.startsWith('image/')) { 
      toast.error('Vui lòng chọn file ảnh'); 
      return; 
    }

    try {
      setUploading(true);
      toast.info('Đang tải logo lên...');
      
      const response = await profileAPI.uploadCompanyAvatar(profile.companyProfileId, file);
      
      if (response?.data?.code === 1000) {
        toast.success('Đã cập nhật logo công ty thành công');
        await fetchCompanyProfile(false); // Refresh profile without spinner
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error('Không thể tải logo lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { 
        toast.error('Banner không được vượt quá 10MB'); 
        return; 
      }
      if (!file.type.startsWith('image/')) { 
        toast.error('Vui lòng chọn file ảnh'); 
        return; 
      }
      toast.success('Đã tải banner công ty');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!profile?.companyProfileId) {
      toast.error('Không tìm thấy thông tin công ty');
      return;
    }

    try {
      setUploading(true);
      toast.info('Đang lưu thay đổi...');
      
      const updateData = {
        companyName: formData.companyName,
        phoneNumber: formData.phone,
        address: formData.address,
        tax: formData.taxCode,
        avatar: profile?.avatar || ''
      };

      const response = await profileAPI.updateCompanyProfile(updateData);
      
      if (response?.data?.code === 1000) {
        toast.success('Đã lưu thay đổi thành công!');
        await fetchCompanyProfile(false); // Refresh profile without spinner
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('Error updating company profile:', err);
      const errorMessage = err.response?.data?.message || 'Không thể lưu thay đổi';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <LoadingSpinner text="Đang tải thông tin hồ sơ doanh nghiệp..." fullPage={true} />
        <Footer />
      </div>
    );
  }

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
        <CompanySidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-surface">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Company Info Section */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-xl ring-4 ring-surface-container overflow-hidden bg-white p-4">
                    <img alt="Company Logo" className="w-full h-full object-contain" src={profile?.avatar || user?.avatar || 'https://via.placeholder.com/150'}/>
                  </div>
                  <label htmlFor="logo-upload" className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </label>
                  <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-manrope font-extrabold tracking-tight text-primary">Thông tin công ty</h2>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
                      Cập nhật lần cuối: {profile.lastUpdated}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tên công ty</label>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" 
                        type="text" 
                        name="companyName" 
                        value={formData.companyName} 
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                      <input
                        className="w-full bg-surface-container border border-outline-variant rounded-lg p-3 text-sm text-on-surface-variant cursor-not-allowed"
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Số điện thoại</label>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Mã số thuế</label>
                      <input 
                        className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" 
                        type="text" 
                        name="taxCode" 
                        value={formData.taxCode} 
                        onChange={handleInputChange}
                      />
                    </div>

                  </div>
                  <div className="mt-6 space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Địa chỉ</label>
                    <input 
                      className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange}
                    />
                  </div>
                  
                </div>
              </div>
            </section>

            {/* Benefits Section */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-manrope font-bold text-primary">Phúc lợi & Đãi ngộ</h3>
                <button className="text-secondary hover:underline flex items-center space-x-1 text-sm font-semibold">
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span>Thêm phúc lợi</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.benefits && profile.benefits.length > 0 ? (
                  profile.benefits.map(benefit => (
                    <div key={benefit.id} className="flex gap-4 p-4 bg-surface rounded-lg border border-outline-variant">
                      <div className="h-12 w-12 rounded-lg bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-secondary">{benefit.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-on-surface">{benefit.title}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{benefit.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-on-surface-variant text-center py-4">Chưa thêm phúc lợi nào</p>
                )}
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave} 
                className="bg-secondary text-white px-10 py-4 rounded-lg font-manrope font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2"
              >
                <span>Lưu thay đổi</span>
                <span className="material-symbols-outlined">check_circle</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default CompanyProfilePage;
