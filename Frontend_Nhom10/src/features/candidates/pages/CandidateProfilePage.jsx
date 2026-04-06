import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { jobAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import ProfileSidebar from '../../../components/layout/ProfileSidebar';
import { Link } from 'react-router-dom';

const CandidateProfilePage = () => {
  const { user } = useAuth();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch applied jobs từ Backend API
      const appliedResponse = await jobAPI.getMyApplications();
      console.log('✅ Applied jobs response:', appliedResponse);
      if (appliedResponse?.data?.result) {
        setAppliedJobs(appliedResponse.data.result);
      }

      // Fetch saved jobs từ localStorage + API
      const savedResponse = await jobAPI.getSavedJobs();
      console.log('✅ Saved jobs response:', savedResponse);
      if (savedResponse?.data?.result) {
        setSavedJobs(savedResponse.data.result);
      }
    } catch (err) {
      console.error('❌ Error fetching profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      await jobAPI.unsaveJob(jobId);
      // Refresh saved jobs
      const savedResponse = await jobAPI.getSavedJobs();
      if (savedResponse?.data?.result) {
        setSavedJobs(savedResponse.data.result);
      }
    } catch (err) {
      console.error('❌ Error unsaving job:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đang xem xét' },
      'ACCEPTED': { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã duyệt' },
      'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', label: 'Từ chối' },
      'WITHDRAWN': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Đã rút' }
    };
    const badge = badges[status] || badges['PENDING'];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatSalary = (min, max) => {
    if (!min || min === 0) return 'Thỏa thuận';
    
    // Convert to millions
    const minMil = min >= 1000000 ? min / 1000000 : min;
    const maxMil = max >= 1000000 ? max / 1000000 : (max || minMil * 1.5);
    
    return `${minMil.toFixed(0)} - ${maxMil.toFixed(0)} triệu`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex flex-1 pt-16">
          <ProfileSidebar />
          <main className="flex-1 p-8 bg-surface overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-5xl text-primary animate-spin">refresh</span>
              <p className="mt-4 text-on-surface-variant">Đang tải...</p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <Header />
      
      <div className="flex flex-1 pt-16">
        <ProfileSidebar />
        
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Việc làm đã ứng tuyển */}
            <section>
              <div className="flex items-end gap-4 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-primary leading-none">
                  Việc làm đã ứng tuyển
                </h2>
                <div className="h-[2px] flex-1 bg-surface-container mb-1"></div>
                <span className="text-sm font-bold text-teal-600 uppercase tracking-widest pb-1">
                  {appliedJobs.length} hồ sơ
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
                {appliedJobs.length === 0 ? (
                  <div className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-6xl mb-4 block">assignment</span>
                    <p>Bạn chưa ứng tuyển công việc nào</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low">
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            Tên công việc
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            Công ty
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                            Ngày ứng tuyển
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {appliedJobs.map((application) => (
                          <tr key={application.applicationId} className="hover:bg-surface-container-low transition-colors duration-200">
                            <td className="px-6 py-6 font-semibold text-primary">
                              <Link 
                                to={`/jobs/${application.jobPosting?.jobPostingId}`}
                                className="hover:text-secondary transition-colors"
                              >
                                {application.jobPosting?.title || 'N/A'}
                              </Link>
                            </td>
                            <td className="px-6 py-6 text-on-surface-variant">
                              {application.jobPosting?.companyProfile?.companyName || 'N/A'}
                            </td>
                            <td className="px-6 py-6 text-on-surface-variant">
                              {new Date(application.appliedAt || application.createdDate).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-6 text-right">
                              {getStatusBadge(application.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* Việc làm đã lưu */}
            <section>
              <div className="flex items-end gap-4 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-primary leading-none">
                  Việc làm đã lưu
                </h2>
                <div className="h-[2px] flex-1 bg-surface-container mb-1"></div>
                <span className="text-sm font-bold text-teal-600 uppercase tracking-widest pb-1">
                  {savedJobs.length > 0 ? 'Xem tất cả' : `${savedJobs.length} công việc`}
                </span>
              </div>

              {savedJobs.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl">
                  <span className="material-symbols-outlined text-6xl mb-4 block">bookmark_border</span>
                  <p>Bạn chưa lưu công việc nào</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedJobs.map((job) => {
                    const companyInitial = job.companyProfile?.companyName?.charAt(0)?.toUpperCase() || '?';
                    
                    return (
                      <div 
                        key={job.jobPostingId}
                        className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-[0_20px_40px_rgba(0,32,69,0.06)] transition-all duration-300 relative border border-transparent hover:border-teal-100"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center p-2">
                            {job.companyProfile?.logo ? (
                              <img 
                                src={job.companyProfile.logo} 
                                alt={job.companyProfile.companyName}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                {companyInitial}
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => handleUnsaveJob(job.jobPostingId)}
                            className="text-teal-600 bg-teal-50 p-2 rounded-full hover:bg-teal-600 hover:text-white transition-all"
                          >
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                              bookmark
                            </span>
                          </button>
                        </div>

                        <h3 className="text-lg font-bold text-primary group-hover:text-teal-700 transition-colors mb-1">
                          {job.title}
                        </h3>
                        <p className="text-on-surface-variant text-sm mb-4">
                          {job.companyProfile?.companyName || 'N/A'}
                        </p>

                        <div className="flex items-center gap-2 mb-6">
                          <span className="text-sm font-semibold text-teal-700">
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                        </div>

                        <Link
                          to={`/jobs/${job.jobPostingId}`}
                          className="block w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold text-sm text-center tracking-wide hover:bg-primary-container transition-colors"
                        >
                          Ứng tuyển ngay
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Quote */}
            <section className="relative py-12 px-12 bg-primary-container rounded-3xl overflow-hidden">
              <span 
                className="material-symbols-outlined absolute -top-4 -left-4 text-9xl text-teal-500/20"
                style={{ fontSize: '144px' }}
              >
                format_quote
              </span>
              <div className="relative z-10 max-w-3xl">
                <p className="text-2xl text-surface-container-lowest font-headline font-bold leading-tight mb-4 italic">
                  "Sự chuẩn bị kỹ lưỡng hôm nay là chìa khóa cho sự thành công vượt bậc của bạn vào ngày mai."
                </p>
                <p className="text-teal-300 font-semibold tracking-widest uppercase text-xs">
                  Mẹo nghề nghiệp • TalentLink Editorial
                </p>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
            </section>
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default CandidateProfilePage;
