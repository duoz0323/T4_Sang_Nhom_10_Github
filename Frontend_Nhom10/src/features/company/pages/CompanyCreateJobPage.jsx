import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { jobAPI, locationAPI, industryAPI, skillAPI } from '../../../services/api';
import { MOCK_LOCATIONS, MOCK_INDUSTRIES, MOCK_SKILLS } from '../../../constants';
import Header from '../../../components/layout/Header';
import CompanySidebar from '../../../components/layout/CompanySidebar';

function CompanyCreateJobPage() {
  const { id } = useParams(); // If ID exists, we are an Edit page
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Dữ liệu chính (Master data)
  const [locations, setLocations] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [skills, setSkills] = useState([]);

  // Trạng thái của form
  const [formData, setFormData] = useState({
    title: '',
    industryId: '',
    locationId: '',
    skillIds: [], 
    salaryRequire: '',
    deadline: '',
    description: '',
    requirements: '',
    benefits: ''
  });

  useEffect(() => {
    // Tải dữ liệu danh mục
    const fetchMasterData = async () => {
      try {
        const [locRes, indRes, skillRes] = await Promise.all([
          locationAPI.search('').catch(() => ({ data: { result: MOCK_LOCATIONS } })),
          industryAPI.getAll().catch(() => ({ data: { result: MOCK_INDUSTRIES } })),
          skillAPI.search('').catch(() => ({ data: { result: MOCK_SKILLS } }))
        ]);
        if (locRes.data?.result) setLocations(locRes.data.result);
        if (indRes.data?.result) setIndustries(indRes.data.result);
        if (skillRes.data?.result) setSkills(skillRes.data.result);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchMasterData();
  }, []);

  useEffect(() => {
    // Nếu có ID, tải dữ liệu Job để Edit
    if (id) {
      const fetchJob = async () => {
        try {
          let res;
          try {
            res = await jobAPI.getJobById(id);
          } catch(e) {
            // fallback for inactive posts since public api rejects them
            const myJobsRes = await jobAPI.getMyJobs();
            if (myJobsRes.data?.result) {
                const match = myJobsRes.data.result.find(j => String(j.id || j.jobPostingId) === String(id));
                if (match) {
                    res = { data: { result: match } };
                } else {
                    throw new Error('Not Found');
                }
            }
          }
          if (res?.data?.result) {
            const job = res.data.result;
            // Parse description into 3 parts if formatted that way
            let desc = job.description || "";
            let reqs = "";
            let benfs = "";
            
            const reqSplit = desc.split('### Yêu cầu ứng viên:');
            if (reqSplit.length > 1) {
              desc = reqSplit[0].trim();
              const benSplit = reqSplit[1].split('### Quyền lợi & Chế độ:');
              if (benSplit.length > 1) {
                reqs = benSplit[0].trim();
                benfs = benSplit[1].trim();
              } else {
                reqs = reqSplit[1].trim();
              }
            } else {
              const benSplit = desc.split('### Quyền lợi & Chế độ:');
              if (benSplit.length > 1) {
                desc = benSplit[0].trim();
                benfs = benSplit[1].trim();
              }
            }

            setFormData({
              title: job.title || '',
              industryId: job.industry?.industryId || '',
                locationId: job.locations?.[0]?.id || job.locations?.[0]?.locationId || '',
              skillIds: job.skills ? job.skills.map(s => s.skillId) : [],
              salaryRequire: job.salaryRequire || '',
              deadline: job.deadline ? job.deadline : '',
              description: desc,
              requirements: reqs,
              benefits: benfs
            });
          }
        } catch (error) {
          toast.error('Không thể tải thông tin tin tuyển dụng');
          navigate('/company/manage-jobs');
        }
      };
      fetchJob();
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    if (e.target.name === 'industryId') {
      setFormData(prev => ({ ...prev, skillIds: [], industryId: e.target.value }));
      return;
    }

    if (e.target.name === 'industryId') {
      setFormData(prev => ({ ...prev, skillIds: [], industryId: e.target.value }));
      return;
    }

    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.industryId || !formData.locationId || !formData.salaryRequire || !formData.deadline || !formData.skillIds || formData.skillIds.length === 0) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (Tiêu đề, Nghành nghề, Kỹ năng, Địa điểm, Mức lương, Hạn chót)');
      return;
    }

    setLoading(true);
    try {
      // Xây dựng mô tả công việc đầy đủ
      let fullDescription = formData.description;
      if (formData.requirements) fullDescription += `\n\n### Yêu cầu ứng viên:\n${formData.requirements}`;
      if (formData.benefits) fullDescription += `\n\n### Quyền lợi & Chế độ:\n${formData.benefits}`;

      const payload = {
        title: formData.title,
        industryId: Number(formData.industryId),
        locations: [Number(formData.locationId)],
        skillIds: formData.skillIds.map(Number),
        salaryRequire: Number(formData.salaryRequire),
        deadline: formData.deadline,
        description: fullDescription
      };

      if (id) {
        await jobAPI.updateJob(id, payload);
        toast.success('Đã cập nhật tin tuyển dụng thành công!');
      } else {
        await jobAPI.createJob(payload);
        toast.success('Đã đăng tin tuyển dụng thành công!');
      }
      
      setTimeout(() => navigate('/company/manage-jobs'), 500);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Lỗi khi lưu tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex mt-16 max-w-[1920px] mx-auto w-full">
        {/* Sidebar */}
        <div className="w-[280px] shrink-0 border-r border-slate-200/60 bg-white shadow-sm hidden lg:block">
          <CompanySidebar />
        </div>

        {/* Main Content */}
        <main className="flex-1 max-w-[1200px] py-12 px-6 lg:px-12 w-full mx-auto relative min-h-screen">
          <div className="max-w-4xl mx-auto">
            
            {/* Breadcrumbs */}
            <nav className="mb-6 flex items-center text-xs font-semibold text-slate-500 uppercase tracking-widest">
              <span className="hover:text-secondary cursor-pointer" onClick={() => navigate('/company/manage-jobs')}>Quản lý tin đăng</span>
              <span className="mx-2 text-slate-300">/</span>
              <span className="text-secondary">{id ? "Sửa tin tuyển dụng" : "Tạo tin tuyển dụng mới"}</span>
            </nav>

            {/* Header Section */}
            <header className="mb-12">
              <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">
                {id ? "Chỉnh sửa tin tuyển dụng" : "Đăng tin tuyển dụng"}
              </h1>
              <p className="text-slate-500 max-w-2xl leading-relaxed">
                Tạo một bản mô tả công việc chuyên nghiệp để thu hút những ứng viên hàng đầu cho vị trí nhân sự cấp cao.
              </p>
            </header>

            {/* Multi-section Form */}
            <form onSubmit={handleSubmit} className="space-y-10">
              
              {/* Section 1: Thông tin công việc */}
              <section className="bg-white rounded-xl p-8 border border-slate-200/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <div className="flex items-center gap-3 mb-8 text-primary">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">info</span>
                  </div>
                  <h2 className="text-xl font-bold font-headline">Thông tin công việc</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Job Title */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Tiêu đề công việc <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="title" 
                      value={formData.title} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full bg-slate-50 border outline-none border-slate-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400 font-medium" 
                      placeholder="Vd: Giám đốc Điều hành (COO)" 
                    />
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Ngành nghề <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="industryId" value={formData.industryId} onChange={handleInputChange} required className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium cursor-pointer">
                        <option value="">Chọn ngành nghề</option>
                        {industries.map(ind => (
                          <option key={ind.industryId} value={ind.industryId}>{ind.nameIndustry}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  </div>

                  {/* Skill (Added mapping for backend) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Kỹ năng yêu cầu <span className="text-red-500">*</span></label>
                    {!formData.industryId ? (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 mt-2">Vui lòng chọn ngành nghề trước để xem các kỹ năng phù hợp.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg mt-2 max-h-60 overflow-y-auto">
                            {skills.filter(sk => String(sk.industryId) === String(formData.industryId)).length > 0 ? (
                              skills.filter(sk => String(sk.industryId) === String(formData.industryId)).map(sk => (
                                <label key={sk.skillId} className="flex items-center space-x-3 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    value={sk.skillId}
                                    checked={(formData.skillIds || []).includes(sk.skillId) || (formData.skillIds || []).includes(String(sk.skillId))}
                                    onChange={(e) => {
                                      const targetVal = Number(e.target.value);
                                      setFormData(prev => {
                                        const current = prev.skillIds || [];
                                        if (e.target.checked) return { ...prev, skillIds: [...current, targetVal] };
                                        return { ...prev, skillIds: current.filter(id => Number(id) !== targetVal) };
                                      });
                                    }}
                                    className="form-checkbox h-5 w-5 text-primary rounded border-slate-300 focus:ring-primary focus:ring-offset-0 transition-all"
                                  />
                                  <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">{sk.skillName}</span>
                                </label>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500 italic col-span-3">Không có kỹ năng nào cho ngành này.</p>
                          )}
                        </div>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Địa điểm làm việc <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select name="locationId" value={formData.locationId} onChange={handleInputChange} required className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium cursor-pointer pl-10">
                        <option value="">Khu vực làm việc</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.id}>{loc.city}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute left-3 top-3 pointer-events-none text-slate-400">location_on</span>
                      <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-slate-400">expand_more</span>
                    </div>
                  </div>

                  {/* Salary Range */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mức lương tối thiểu <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <input 
                        type="number" 
                        name="salaryRequire" 
                        value={formData.salaryRequire} 
                        onChange={handleInputChange} 
                        required 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-400" 
                        placeholder="Vd: 20000000" 
                      />
                      <span className="absolute right-4 top-3 text-sm font-semibold text-slate-400">VND</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Hạn chót nộp hồ sơ <span className="text-red-500">*</span></label>
                    <input 
                      type="date" 
                      name="deadline" 
                      value={formData.deadline} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium" 
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Nội dung chi tiết */}
              <section className="bg-white rounded-xl p-8 border border-slate-200/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] relative">
                <div className="flex items-center gap-3 mb-8 text-primary">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">description</span>
                  </div>
                  <h2 className="text-xl font-bold font-headline">Nội dung chi tiết</h2>
                </div>

                <div className="space-y-8">
                  {/* Job Description */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả công việc</label>
                      <span className="text-[10px] text-slate-400 font-medium">Sử dụng Markdown để định dạng</span>
                    </div>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-400" 
                      placeholder="Mô tả các trách nhiệm chính, mục tiêu công việc và bối cảnh của vị trí này..." 
                      rows="6"
                    ></textarea>
                  </div>

                  {/* Requirements */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Yêu cầu ứng viên</label>
                    <textarea 
                      name="requirements" 
                      value={formData.requirements} 
                      onChange={handleInputChange} 
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-400" 
                      placeholder="Liệt kê các kỹ năng, bằng cấp và kinh nghiệm cần thiết..." 
                      rows="6"
                    ></textarea>
                  </div>

                  {/* Benefits */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Quyền lợi & Chế độ</label>
                    <textarea 
                      name="benefits" 
                      value={formData.benefits} 
                      onChange={handleInputChange} 
                      className="w-full bg-slate-50 border border-slate-200 outline-none rounded-lg px-4 py-3 focus:bg-white focus:ring-0 focus:border-primary transition-all text-slate-800 font-medium placeholder:text-slate-400" 
                      placeholder="Các đãi ngộ, bảo hiểm, môi trường làm việc và cơ hội thăng tiến..." 
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-6 pt-6">
                <button 
                  type="button" 
                  onClick={() => navigate('/company/manage-jobs')}
                  className="text-slate-500 font-semibold text-sm hover:text-slate-700 transition-all"
                >Hủy bỏ</button>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-primary text-white px-10 py-4 rounded-lg font-bold text-base shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : (id ? 'Lưu thay đổi' : 'Đăng tin ngay')}
                  {!loading && <span className="material-symbols-outlined">{id ? 'save' : 'rocket_launch'}</span>}
                </button>
              </div>
            </form>

          </div>
        </main>
      </div>

    </div>
  );
}

export default CompanyCreateJobPage;
