import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import { companyAPI, jobAPI } from '../../../services/api';

function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching company details for ID:', id);

      // Fetch company profile
      const companyResponse = await companyAPI.getCompanyById(id);
      console.log('📋 Company response:', companyResponse);

      if (companyResponse?.data?.result) {
        const companyData = companyResponse.data.result;
        setCompany(companyData);

        // Fetch jobs for this company
        try {
          const jobsResponse = await jobAPI.getAllActiveJobs({ companyId: id });
          console.log('📋 Jobs response:', jobsResponse);
          
          if (jobsResponse?.data?.result && Array.isArray(jobsResponse.data.result)) {
            setJobs(jobsResponse.data.result);
          } else {
            setJobs([]);
          }
        } catch (jobErr) {
          console.warn('⚠️ Could not fetch jobs for company:', jobErr);
          setJobs([]); // Continue without jobs
        }
      } else {
        throw new Error('Không tìm thấy thông tin công ty');
      }
    } catch (err) {
      console.error('❌ Error fetching company data:', err);
      setError(err.message || 'Không thể tải thông tin công ty');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
            <p className="text-on-surface font-bold text-xl mb-2">❌ {error}</p>
            <button 
              onClick={() => navigate('/companies')}
              className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container transition-colors"
            >
              ← Quay lại danh sách
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">business</span>
            <p className="text-on-surface-variant">Không tìm thấy công ty</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface pt-16">
      <Header />

      {/* Hero Section: Company Identity */}
      <header className="relative w-full h-[400px] overflow-hidden">
        <img
          className="w-full h-full object-cover grayscale-[20%] brightness-75"
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200"
          alt="Company office"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full px-8 pb-12 max-w-7xl mx-auto flex items-end justify-between gap-8">
          <div className="flex items-end gap-8">
            {/* Logo */}
            <div className="w-32 h-32 bg-white rounded-xl shadow-2xl p-4 flex items-center justify-center -mb-8 z-10">
              <img
                className="w-full h-full object-contain"
                src={company.companyLogo}
                alt={company.companyName}
              />
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                {company.isPremium && (
                  <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                    Premium Partner
                  </span>
                )}
                {company.rating && (
                  <div className="flex gap-1 text-secondary-fixed">
                    {[...Array(company.rating)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {company.companyName}
              </h1>
              <p className="text-white/90 font-medium mt-2 max-w-2xl">
                {company.description}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-3 rounded-lg hover:bg-white/20 transition-all">
              <span className="material-symbols-outlined">share</span>
              <span className="text-sm font-semibold">Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 bg-secondary text-on-secondary px-8 py-3 rounded-lg shadow-xl hover:opacity-90 transition-all font-semibold">
              Theo dõi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: About & Vision */}
        <div className="lg:col-span-7 space-y-16">
          {/* Vision & Mission */}
          {company.description && (
            <div>
              <span className="text-secondary font-bold tracking-widest text-[11px] uppercase mb-4 block">
                Về chúng tôi
              </span>
              <h2 className="font-headline text-3xl font-bold text-primary mb-6 leading-tight">
                {company.companyName}
              </h2>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                {company.description}
              </p>
            </div>
          )}

          {/* Office Gallery: Bento Grid */}
          <div>
            <span className="text-secondary font-bold tracking-widest text-[11px] uppercase mb-4 block">
              Môi trường làm việc
            </span>
            <h2 className="font-headline text-3xl font-bold text-primary mb-8">
              Không gian khơi nguồn sáng tạo.
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-2 gap-4 h-[500px]">
              <div className="col-span-2 row-span-2 relative overflow-hidden rounded-xl group">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600"
                  alt="Workspace"
                />
              </div>
              <div className="col-span-2 relative overflow-hidden rounded-xl group">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600"
                  alt="Meeting room"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl group">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300"
                  alt="Team"
                />
              </div>
              <div className="relative overflow-hidden rounded-xl group">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=300"
                  alt="Office kitchen"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar Stats & Jobs */}
        <div className="lg:col-span-5 space-y-12">
          {/* Stats Card */}
          <div className="bg-primary text-white p-10 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-8">
              {company.companySize && (
                <div>
                  <span className="text-primary-fixed-dim text-xs font-bold uppercase tracking-widest">
                    Quy mô
                  </span>
                  <div className="text-5xl font-extrabold mt-1">{company.companySize} nhân viên</div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                {company.address && (
                  <div>
                    <span className="text-primary-fixed-dim text-[10px] font-bold uppercase">Địa chỉ</span>
                    <div className="text-sm font-bold">{company.address}</div>
                  </div>
                )}
                {company.foundedYear && (
                  <div>
                    <span className="text-primary-fixed-dim text-[10px] font-bold uppercase">Thành lập</span>
                    <div className="text-xl font-bold">{company.foundedYear}</div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-primary bg-secondary flex items-center justify-center text-white text-xs font-bold">
                    JM
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary bg-primary-container flex items-center justify-center text-white text-xs font-bold">
                    TC
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-primary bg-tertiary flex items-center justify-center text-white text-xs font-bold">
                    NH
                  </div>
                </div>
                <span className="text-sm text-primary-fixed-dim">Join our leadership team</span>
              </div>
            </div>
          </div>

          {/* Job Postings List */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-secondary font-bold tracking-widest text-[11px] uppercase mb-1 block">
                  Cơ hội nghề nghiệp
                </span>
                <h3 className="font-headline text-2xl font-bold text-primary">Vị trí đang tuyển</h3>
              </div>
              <span className="text-on-surface-variant text-sm font-medium">
                {jobs.length} jobs available
              </span>
            </div>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-3">work_off</span>
                  <p>Chưa có tin tuyển dụng nào</p>
                </div>
              ) : (
                jobs.map((job) => (
                  <Link
                    key={job.jobPostingId}
                    to={`/jobs/${job.jobPostingId}`}
                    className="block bg-surface-container-lowest p-6 rounded-xl group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border border-transparent hover:border-outline-variant/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-primary group-hover:text-secondary transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-sm">location_on</span>
                          {job.location?.locationName || job.address || 'Chưa rõ'} • {job.workingFormat || 'Full-time'}
                        </p>
                      </div>
                      {job.isHot && (
                        <span className="bg-primary-fixed text-on-primary-fixed text-[10px] font-bold px-2 py-1 rounded">
                          HOT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">
                          {job.employmentType || 'Full-time'}
                        </span>
                        <span className="px-3 py-1 bg-surface-container text-on-surface-variant text-xs font-semibold rounded-full">
                          {job.salary || 'Thỏa thuận'}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all">
                        arrow_forward
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <button className="w-full mt-8 py-4 border-2 border-outline-variant text-primary font-bold rounded-xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300">
              Xem tất cả công việc
            </button>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {company.testimonial && (
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <div className="relative max-w-4xl">
              <span
                className="material-symbols-outlined text-8xl text-secondary-fixed opacity-30 absolute -left-12 -top-12"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                format_quote
              </span>
              <h3 className="font-headline text-3xl md:text-4xl font-extrabold text-primary leading-tight mb-8 relative z-10">
                {company.testimonial.quote}
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {company.testimonial.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-primary">{company.testimonial.author}</div>
                  <div className="text-sm text-on-surface-variant">{company.testimonial.position}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default CompanyDetailPage;
