import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { jobAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userRole } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    coverLetter: '',
    cv: null
  });

  useEffect(() => {
    fetchJobDetail();
    if (isAuthenticated && (userRole === 'APPLICANT' || userRole === 'CANDIDATE')) {
      checkIfSaved();
    }
  }, [id, isAuthenticated]);

  const fetchJobDetail = async () => {
    try {
      // ✅ KHÔNG CẦN ensureAuthenticated() - /posts/{id} là PUBLIC endpoint
      const response = await jobAPI.getJobById(id);
      console.log('📋 Job detail response:', response);

      if (response?.data?.result) {
        const jobData = response.data.result;
        console.log('✅ Job data:', jobData);

        // Ánh xạ cấu trúc dữ liệu backend sang frontend
        const mappedJob = {
          jobPostingId: jobData.jobPostingId,
          title: jobData.title,
          companyName: jobData.companyProfile?.companyName || 'Công ty tuyển dụng',
          companyLogo: jobData.companyProfile?.avatar || 'https://via.placeholder.com/64',
          companyInfo: jobData.companyProfile?.address || 'Thông tin công ty',
          salaryMin: (() => {
            let min = jobData.salaryRequire || 0;
            if (min > 0 && min < 1000) return min * 1000000;
            if (min >= 1000 && min < 1000000) return min * 1000;
            return min;
          })(),
          salaryMax: (() => {
            let max = jobData.salaryRequire ? jobData.salaryRequire * 1.5 : 0;
            if (max > 0 && max < 1500) return max * 1000000; // 1.5 * 1000 = 1500
            if (max >= 1500 && max < 1500000) return max * 1000;
            return max;
          })(),
          location: jobData.locations?.map(l => l.name || l.city || l.province).filter(Boolean).join(', ') || 'Chưa xác định',
          industry: jobData.industry?.name || jobData.industry?.nameIndustry || 'Chưa xác định',
          deadline: jobData.deadline || 'N/A',
          level: 'Cấp quản lý', // Default as not in BE
          description: jobData.description || 'Phụ trách tuyển dụng nhân sự',
          requirements: jobData.skills?.map(skill => ({
            icon: 'verified',
            title: skill.name || skill.skillName,
            desc: `Yêu cầu về ${skill.name || skill.skillName}`
          })) || [],
          image: jobData.companyProfile?.avatar || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop',
          status: jobData.status
        };
        
        setJob(mappedJob);
      } else {
        console.log('⚠️ No data, using mock');
        setJob(MOCK_JOB);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      console.log('⚠️ Using mock job detail');
      setJob(MOCK_JOB);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await jobAPI.getMyApplications();
      // console.log('My applications payload:', response?.data?.result);
      if (response?.data?.result && Array.isArray(response.data.result)) {
        // Look for application to THIS specific jobPostingId 
        const existingApp = response.data.result.find(
           app => app.jobPosting?.id === id || app.jobPostingId === id
        );
        if (existingApp) {
          setIsApplied(true);
          setApplicationStatus(existingApp.status || 'Đã gửi');
        }
      }
    } catch (err) {
      console.error('Lỗi khi kiểm tra trạng thái ứng tuyển:', err);
    }
  };

  const checkIfSaved = async () => {
    try {
      const response = await jobAPI.checkIfSaved(id);
      if (response?.data?.result) {
        setIsSaved(response.data.result);
      }
    } catch (err) {
      console.error('❌ Error checking saved status:', err);
    }
  };

  const toggleSaveJob = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu công việc');
      navigate('/login');
      return;
    }

    // ✅ Backend trả về role là "APPLICANT" không phải "CANDIDATE"
    if (userRole !== 'APPLICANT' && userRole !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể lưu công việc');
      return;
    }

    try {
      console.log('💾 Toggling save job:', id, 'Current state:', isSaved);

      if (isSaved) {
        console.log('🔓 Removing from saved jobs');
        await jobAPI.unsaveJob(id);
        setIsSaved(false);
        toast.success('Đã bỏ lưu công việc');
      } else {
        console.log('🔖 Adding to saved jobs');
        await jobAPI.saveJob(id);
        setIsSaved(true);
        toast.success('Đã lưu công việc thành công');
      }
    } catch (err) {
      console.error('❌ Error toggling save:', err);
      // Nếu tính năng chưa được thực hiện trong backend, chỉ hiển thị thông báo
      if (err.response?.status === 404 || err.message?.includes('not implemented')) {
        console.warn('⚠️ Save jobs feature not yet implemented in backend');
        // Theo tùy chọn vẫn chuyển đổi trạng thái UI cục bộ
        setIsSaved(!isSaved);
      } else {
        toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      if (file.size <= 10 * 1024 * 1024) {
        setFormData(prev => ({
          ...prev,
          cv: file
        }));
        toast.success(`Đã chọn file: ${file.name}`);
      } else {
        toast.error('File quá lớn. Vui lòng chọn file dưới 1MB (Giới hạn của máy chủ)');
      }
    } else {
      toast.error('Vui lòng chọn file PDF hoặc DOCX');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Validation Layer
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để ứng tuyển');
      navigate('/login');
      return;
    }

    // ✅ Backend trả về role là "APPLICANT" không phải "CANDIDATE"
    if (userRole !== 'APPLICANT' && userRole !== 'CANDIDATE') {
      toast.error('Chỉ ứng viên mới có thể ứng tuyển');
      return;
    }

    if (!formData.fullName?.trim() || !formData.email?.trim() || !formData.phone?.trim() || !formData.cv) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email không hợp lệ');
      return;
    }

    setIsApplying(true);

    try {
      console.log('📤 Submitting application for job:', id);

      // ✅ Correct API call format - PHONE là REQUIRED
      const applicationData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() // ✅ Phone bắt buộc
      };

      const response = await jobAPI.applyJob(id, applicationData, formData.cv);

      console.log('✅ Application response:', response);

      if (response?.data?.code === 1000 || response?.data?.result) {
        toast.success('🎉 Đơn ứng tuyển đã được Gửi Thành Công!', {
            description: 'Nhà tuyển dụng sẽ xem xét hồ sơ của bạn và phản hồi sớm nhất.',
            duration: 6000,
            action: {
              label: 'Xem đơn của tôi',
              onClick: () => navigate('/profile')
            },
            style: { border: '1px solid #10b981', color: '#10b981' }
          });
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          coverLetter: '',
          cv: null
        });
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const errorMsg = response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        console.error('❌ Application error:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('❌ Error applying job:', err);
      let errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Có lỗi xảy ra khi gửi đơn ứng tuyển';
      
      if (typeof errorMessage === 'object') errorMessage = JSON.stringify(errorMessage);
      errorMessage = String(errorMessage);
      
      if (errorMessage.includes('Uncategorized error') || err.response?.status === 413) {
          errorMessage = 'Dung lượng file CV vượt quá giới hạn 1MB của máy chủ.';
      } else if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('ứng tuyển rồi') || errorMessage.toLowerCase().includes('applied')) {    
          errorMessage = 'Bạn đã ứng tuyển công việc này rồi!';
          setIsApplied(true);
      }

      if (err.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để ứng tuyển.');
      } else {
        toast.error('❌ ' + errorMessage, {
          style: { border: '1px solid #ef4444', color: '#ef4444' }
        });
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">refresh</span>
          <p className="mt-4 text-on-surface-variant">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">work_off</span>
          <p className="mt-4 text-on-surface-variant text-xl">Không tìm thấy công việc</p>
          <button 
            onClick={() => navigate('/jobs')} 
            className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-container transition-all"
          >
            Quay lại danh sách
          </button>
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
          .glass-effect {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
        `}
      </style>

      {/* Tiêu đề */}
      <Header />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
        {/* Nút quay lại */}
        <div className="mb-8">
          <button 
            onClick={() => navigate('/jobs')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold transition-colors group bg-white px-4 py-2 rounded-lg border border-surface-container shadow-sm"
          >
            <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
            Quay lại
          </button>
        </div>

        {/* Vùng chứa nội dung chính */}
        <div className="bg-white rounded-2xl border border-surface-container shadow-[0_32px_64px_-16px_rgba(0,32,69,0.08)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Cột chi tiết */}
            <div className="lg:col-span-8 p-6 md:p-8 lg:border-r border-surface-container">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                      {job.level}
                    </span>
                    <span className="text-on-surface-variant font-label text-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">schedule</span>
                      Hạn nộp hồ sơ: {job.deadline}
                    </span>
                  </div>
                  <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-primary tracking-tight mb-4">
                    {job.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-xl">apartment</span>
                      <span className="font-bold text-on-surface">{job.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-xl">location_on</span>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-xl">work</span>
                      <span>{job.industry}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/5 border border-secondary/20 px-6 py-4 rounded-xl text-center min-w-40">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Mức lương</p>
                  <p className="text-lg font-black text-primary">
                    {job.salaryMin > 0 ? `${(job.salaryMin / 1000000).toFixed(0)} triệu - ${(job.salaryMax / 1000000).toFixed(0)} triệu` : "Thỏa thuận"}
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Hình ảnh */}
                <div className="relative w-full h-64 rounded-xl overflow-hidden shadow-xl ring-1 ring-black/5">
                  <img
                    alt={job.title}
                    className="w-full h-full object-cover"
                    src={job.image}
                  />
                </div>

                {/* Mô tả công việc */}
                <section>
                  <h2 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-secondary rounded-full"></span>
                    Mô tả công việc
                  </h2>
                  <div className="font-body text-base text-on-surface-variant leading-relaxed space-y-4">
                    <p>{job.description}</p>
                  </div>
                </section>

                {/* Yêu cầu */}
                <section>
                  <h2 className="font-headline text-xl font-bold text-primary mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-secondary rounded-full"></span>
                    Yêu cầu ứng viên
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-container-low/50 p-6 rounded-xl border border-surface-container">
                    {job.requirements.map((req, index) => (
                      <div key={index} className="flex gap-4">
                        <span className="material-symbols-outlined text-secondary text-3xl">{req.icon}</span>
                        <div>
                          <h4 className="font-bold text-primary mb-1">{req.title}</h4>
                          <p className="text-on-surface-variant text-sm">{req.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            {/* Phần biểu mẫu cột */}
            <aside className="lg:col-span-4 bg-surface-container-lowest p-6 md:p-8">
              <div className="sticky top-24">
                {/* Thông tin tóm tắt */}
                <div className="mb-10 p-6 bg-white rounded-xl border border-surface-container shadow-sm">
                  <h3 className="font-headline text-lg font-bold text-primary mb-6 pb-4 border-b border-surface-container">
                    Thông tin tóm tắt
                  </h3>
                  <dl className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Công ty:</dt>
                      <dd className="font-bold text-primary">{job.companyName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Lĩnh vực:</dt>
                      <dd className="font-bold text-primary">{job.industry}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Địa điểm:</dt>
                      <dd className="font-bold text-primary">{job.location}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-on-surface-variant">Hạn nộp:</dt>
                      <dd className="font-bold text-secondary">{job.deadline}</dd>
                    </div>
                  </dl>
                </div>

                {/* Biểu mẫu ứng tuyển */}
                <div className="bg-white p-6 rounded-xl border border-surface-container shadow-xl">
                  <h3 className="font-headline text-xl font-bold text-primary mb-2">Ứng tuyển ngay</h3>
                  <p className="text-on-surface-variant text-sm mb-8 font-label">
                    Thời gian phản hồi trung bình: 48 giờ
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                        Họ và Tên
                      </label>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-surface-container focus:border-secondary focus:ring-0 focus:bg-white transition-all px-4 py-3 rounded-xl"
                        placeholder="Nguyễn Văn A"
                        type="text"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                        Địa chỉ Email
                      </label>
                      <input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-surface-container focus:border-secondary focus:ring-0 focus:bg-white transition-all px-4 py-3 rounded-xl"
                        placeholder="a.nguyen@example.com"
                        type="email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                        Số điện thoại
                      </label>
                      <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-surface-container focus:border-secondary focus:ring-0 focus:bg-white transition-all px-4 py-3 rounded-xl"
                        placeholder="0912345678"
                        type="tel"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-on-surface-variant mb-2">
                        Hồ sơ / CV
                      </label>
                      <label className="w-full border-2 border-dashed border-outline-variant rounded-xl p-6 text-center hover:border-secondary hover:bg-secondary/5 transition-all cursor-pointer group block">
                        <input
                          type="file"
                          accept=".pdf,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <span className="material-symbols-outlined text-3xl text-outline mb-2 group-hover:text-secondary block">
                          cloud_upload
                        </span>
                        <p className="text-xs font-bold text-on-surface">
                          {formData.cv ? formData.cv.name : 'Tải lên PDF hoặc DOCX'}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1">Dung lượng tối đa 1MB (Giới hạn hệ thống)</p>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-headline font-bold text-base hover:bg-on-secondary-container transition-all active:scale-[0.98] shadow-lg shadow-secondary/25"
                    >
                      Gửi Đơn Ứng Tuyển
                    </button>
                    <p className="text-[9px] text-center text-on-surface-variant uppercase tracking-widest leading-relaxed">
                      Bằng cách nhấp vào gửi, bạn đồng ý với{' '}
                      <Link className="underline text-secondary font-bold" to="/privacy">
                        Chính sách Bảo mật
                      </Link>{' '}
                      của chúng tôi
                    </p>
                  </form>
                </div>

                {/* Thông tin công ty */}
                <div className="mt-8 p-6 bg-primary rounded-xl text-white">
                  <h4 className="font-bold mb-2">Về {job.companyName}</h4>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    {job.companyInfo}
                  </p>
                  <Link className="text-xs font-bold flex items-center gap-1 hover:underline" to={`/company/${job.companyName}`}>
                    Xem hồ sơ công ty{' '}
                    <span className="material-symbols-outlined text-xs">arrow_right_alt</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Chân trang */}
      <Footer />
    </div>
  );
};

const MOCK_JOB = {
  jobPostingId: '1',
  title: 'Giám đốc Kiến trúc Công trình',
  companyName: 'Foster + Partners',
  salaryMin: 140000,
  salaryMax: 180000,
  location: 'An Giang (Làm việc từ xa/Hybrid)',
  industry: 'Công nghệ thông tin',
  deadline: '17-09-2026',
  level: 'Cấp quản lý',
  description: 'Chúng tôi đang tìm kiếm một Giám đốc Kiến trúc Công trình có tầm nhìn để dẫn dắt danh mục dự án nhà ở cao tầng của chúng tôi. Vai trò này không chỉ là quản lý dự án; đó là việc kiến tạo những môi trường định nghĩa lại cuộc sống đô thị. Bạn sẽ lãnh đạo một đội ngũ đa ngành gồm hơn 25 kiến trúc sư và nhà thiết kế cao cấp, báo cáo trực tiếp cho Trưởng bộ phận Thiết kế Toàn cầu. Ứng viên lý tưởng sở hữu sự kết hợp hiếm có giữa sự táo bạo trong sáng tạo và sự khắt khe về kỹ thuật.',
  requirements: [
    { icon: 'verified', title: 'Kinh nghiệm', desc: 'Trên 12 năm giữ các vị trí lãnh đạo tại các công ty kiến trúc quốc tế danh tiếng.' },
    { icon: 'architecture', title: 'Hồ sơ năng lực', desc: 'Minh chứng qua các dự án nhà ở có quy mô trên 100 triệu bảng Anh.' },
    { icon: 'groups', title: 'Lãnh đạo', desc: 'Khả năng dẫn dắt nhân tài cấp cao và mở rộng quy mô bộ phận.' },
    { icon: 'gavel', title: 'Pháp lý & Kỹ thuật', desc: 'Am hiểu chuyên sâu về quy chuẩn xây dựng và tiêu chuẩn bền vững quốc tế.' }
  ],
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAWcsV4juFiAtpkzbEN5vDsCczRjrlY5AQd5oRkGqwblGPVawZpyytD03z49ES0IgJOkr5wERm8nA2x58leql6Tv_RqsQ119SZOTes5r8s41G6ZEkMdRm8NVoEvIlSQJkVv1A_CSf_7Q_DkuMse0qhAWvbE-jN2Ma6PgZjLw41Ym5mfSV33AgrrFuim-_7NUfkJPzn3jC-zjRIqaQBYLo6oVcNxnFb3DoMl4S6KAC9_wUZhDaY2WMVjg-7fAxVMrj9ydhoKylgyTG48',
  companyInfo: 'Một studio toàn cầu về kiến trúc, đô thị và thiết kế, bắt nguồn từ tính bền vững.'
};

export default JobDetailPage;














