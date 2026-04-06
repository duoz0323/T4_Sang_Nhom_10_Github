import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { profileAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProfileSidebar from '../../../components/layout/ProfileSidebar';

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    position: '', 
    email: '', 
    phone: '',
    bio: '',
    address: '',
    birthday: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      toast.error('Vui lòng đăng nhập để xem hồ sơ');
      navigate('/login');
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const response = await profileAPI.getMyCandidateProfile();
      console.log('📋 Profile response:', response?.data);

      if (response?.data?.code === 1000 && response?.data?.result) {
        const profileData = response.data.result;
        console.log('✅ Profile loaded:', profileData);
        setProfile(profileData);
        setFormData({
          name: profileData.fullName || '',
          position: profileData.currentJobTitle || '',
          email: profileData.email || '',
          phone: profileData.phoneNumber || '',
          bio: profileData.description || '',
          address: profileData.address || '',
          birthday: profileData.birthday || ''
        });
      } else if (response?.data?.code === 1006) {
        // Unauthenticated
        console.error('🔒 Code 1006: Unauthenticated');
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 1500);
      } else if (response?.data?.code === 1007) {
        // User not found or bad request
        console.error('⚠️ Code 1007: User not found or bad request');
        toast.error('Không tìm thấy thông tin người dùng. Vui lòng tạo hồ sơ');
      } else {
        const errorMsg = response?.data?.message || 'Không thể tải hồ sơ';
        console.error('❌ Error loading profile:', response?.data);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error fetching profile:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 400) {
        // User chưa có profile → có thể cần tạo mới
        const errorData = err.response?.data;
        console.error('🔴 400 Error - Possibly no profile exists:', errorData);
        
        toast.error('Không tìm thấy hồ sơ. Hãy đăng xuất và đăng nhập lại', {
          duration: 3000
        });
        
        // Don't auto-clear, let user decide
        setTimeout(() => {
          const shouldLogout = confirm('Không tìm thấy hồ sơ của bạn. Đăng xuất và thử lại?');
          if (shouldLogout) {
            localStorage.clear();
            navigate('/login');
          }
        }, 1000);
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('🔒 Phiên đăng nhập hết hạn hoặc không có quyền truy cập');
        localStorage.clear();
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.response?.status === 404) {
        toast.error('❌ Hồ sơ người dùng không được tìm thấy. Vui lòng liên hệ Admin');
        setTimeout(() => navigate('/'), 2000);
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Lỗi kết nối. Vui lòng thử lại';
        console.error('Full error:', err.response?.data);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh không được vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    try {
      setUploading(true);
      toast.info('Đang tải ảnh lên...');

      const profileId = profile?.candidateProfileId || user?.id;
      if (!profileId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await profileAPI.uploadCandidateAvatar(profileId, file);

      if (response?.data?.code === 1000) {
        toast.success('Đã cập nhật ảnh đại diện');
        await fetchProfile();
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('❌ Error uploading avatar:', err);
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file PDF hoặc DOCX');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      toast.info('Đang tải CV lên...');

      // Lấy ID hồ sơ từ profile hoặc user
      const profileId = profile?.candidateProfileId || user?.id;
      if (!profileId) {
        toast.error('Không tìm thấy thông tin người dùng');
        return;
      }

      const response = await profileAPI.uploadCV(profileId, file);

      if (response?.data?.code === 1000) {
        toast.success(`Đã tải CV lên thành công: ${file.name}`);
        await fetchProfile();
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('❌ Error uploading CV:', err);
      toast.error(err.response?.data?.message || 'Không thể tải CV lên');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCV = () => {
    if (window.confirm('Bạn có chắc muốn xóa CV này?')) {
      toast.success('Đã xóa CV');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!profile?.candidateProfileId) {
      toast.error('Không tìm thấy thông tin profile');
      return;
    }

    try {
      setUploading(true);
      toast.info('Đang lưu thay đổi...');

      const updateData = {
        fullName: formData.name,
        phoneNumber: formData.phone,
        address: formData.address,
        description: formData.bio,
        birthday: formData.birthday
      };

      const response = await profileAPI.updateCandidateProfile(
        profile.candidateProfileId,
        updateData
      );

      if (response?.data?.code === 1000) {
        toast.success('Đã lưu thay đổi thành công!');
        await fetchProfile(); // Refresh profile
      } else {
        toast.error(response?.data?.message || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      const errorMessage = err.response?.data?.message || 'Không thể lưu thay đổi';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">refresh</span>
          <p className="mt-4 text-on-surface-variant">Đang tải...</p>
        </div>
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
        <ProfileSidebar />

        {/* Main Content Area */}
        <main className="flex-1 p-8 bg-surface"
>
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Personal Info Section */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full ring-4 ring-surface-container overflow-hidden bg-slate-200">
                    <img alt="User Avatar" className="w-full h-full object-cover" src={profile?.avatar || user?.avatar || 'https://via.placeholder.com/150'}/>
                  </div>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                  </label>
                  <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-manrope font-extrabold tracking-tight text-primary">Thông tin cá nhân</h2>
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">Cập nhật lần cuối: {profile?.lastUpdated || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Họ và Tên</label>
                      <input className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" type="text" name="name" value={formData.name} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Vị trí hiện tại</label>
                      <input className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" type="text" name="position" value={formData.position} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
                      <input className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" type="email" name="email" value={formData.email} onChange={handleInputChange}/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Số điện thoại</label>
                      <input className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" type="text" name="phone" value={formData.phone} onChange={handleInputChange}/>
                    </div>
                  </div>
                  <div className="mt-6 space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Giới thiệu bản thân</label>
                    <textarea className="w-full bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all p-3 text-sm" name="bio" rows="3" value={formData.bio} onChange={handleInputChange}/>
                  </div>
                </div>
              </div>
            </section>

            {/* Experience and Education Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Experience Section */}
              <section className="bg-white border border-outline-variant rounded-xl p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-manrope font-bold text-primary">Kinh nghiệm</h3>
                  <button className="text-secondary hover:underline flex items-center space-x-1 text-sm font-semibold cursor-pointer">
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Thêm</span>
                  </button>
                </div>
                <div className="space-y-8">
                  {(profile?.experiences || []).map(exp => (
                    <div key={exp.id} className="relative pl-6 border-l-2 border-surface-container">
                      <div className={`absolute -left-2.25 top-0 h-4 w-4 rounded-full ${exp.current ? 'bg-secondary' : 'bg-surface-container'} ring-4 ring-white`}></div>
                      <div>
                        <p className="font-bold text-on-surface">{exp.title}</p>
                        <p className={`text-sm ${exp.current ? 'text-secondary' : 'text-on-surface-variant'} font-medium`}>{exp.company} • {exp.period}</p>
                        <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Education Section */}
              <section className="bg-white border border-outline-variant rounded-xl p-8 space-y-6 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-manrope font-bold text-primary">Học vấn</h3>
                  <button className="text-secondary hover:underline flex items-center space-x-1 text-sm font-semibold cursor-pointer">
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Thêm</span>
                  </button>
                </div>
                <div className="space-y-8">
                  {(profile?.education || []).map(edu => (
                    <div key={edu.id} className="flex space-x-4">
                      <div className="h-12 w-12 rounded bg-surface-container flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary">{edu.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{edu.institution}</p>
                        <p className="text-sm text-on-surface-variant font-medium">{edu.degree}</p>
                        <p className="text-xs text-on-surface-variant mt-1">{edu.period}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* CV Upload Section */}
            <section className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-manrope font-bold text-primary mb-6">Tải lên CV (PDF/DOCX)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {profile?.cv ? (
                  <div className="bg-white p-6 rounded-lg flex items-center justify-between border-dashed border-2 border-outline-variant shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="h-14 w-10 bg-red-50 text-red-600 rounded flex items-center justify-center border border-red-100">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>picture_as_pdf</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface truncate max-w-37.5">{profile?.cv?.filename || 'CV.pdf'}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tight">Cập nhật: {profile?.cv?.uploadedAt || 'N/A'} • {profile?.cv?.size || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 bg-surface-container-highest rounded-lg text-on-surface-variant hover:bg-primary hover:text-white transition-all duration-200 hover:shadow-md hover:scale-110 cursor-pointer">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <button className="p-2 bg-surface-container-highest rounded-lg text-on-surface-variant hover:bg-error hover:text-white transition-all duration-200 hover:shadow-md hover:scale-110 cursor-pointer" onClick={handleDeleteCV}>
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-on-surface-variant">Chưa có CV được tải lên</div>
                )}
                
                <label className="group relative bg-surface hover:bg-white border-2 border-dashed border-outline-variant hover:border-secondary rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                  <input className="hidden" type="file" onChange={handleCVUpload}/>
                  <span className="material-symbols-outlined text-4xl text-outline group-hover:text-secondary transition-colors mb-2">cloud_upload</span>
                  <p className="text-sm font-bold text-on-surface">Kéo thả hoặc Click để tải lên</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Định dạng hỗ trợ: PDF, DOCX (Tối đa 5MB)</p>
                </label>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button onClick={handleSave} className="bg-secondary text-white px-10 py-4 rounded-lg font-manrope font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center space-x-2 cursor-pointer">
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

export default ProfilePage;
