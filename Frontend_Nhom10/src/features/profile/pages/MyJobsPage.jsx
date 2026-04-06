import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";
import { jobAPI } from "../../../services/api";
import Header from "../../../components/layout/Header";
import ProfileSidebar from "../../../components/layout/ProfileSidebar";

export default function MyJobsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch applied jobs
      try {
        const appliedResponse = await jobAPI.getMyApplications();
        setAppliedJobs(appliedResponse.data?.result?.content || []);
      } catch(err) {
        console.error("Lỗi khi tải việc làm đã ứng tuyển:", err);
      }

      // Fetch saved jobs
      try {
        const savedResponse = await jobAPI.getSavedJobs();
        setSavedJobs(savedResponse.data?.result || []);
      } catch(err) {
        console.error("Lỗi khi tải việc làm đã lưu:", err);
      }
    } catch (error) {
      console.error("Error fetching jobs data:", error);
      toast.error("Có lỗi khi tải dữ liệu công việc");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await jobAPI.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId && job.postId !== jobId));
      toast.success("Đã huỷ lưu công việc");
    } catch (error) {
      toast.error("Có lỗi khi huỷ lưu công việc");
    }
  };

  const handleApply = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // Format amount
  const formatSalary = (amount) => {
    if (!amount) return "Thoả thuận";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };
  
  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN").format(date);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen font-body flex flex-col">
      <Header />
      <div className="flex flex-1 pt-20">
        <ProfileSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 p-8 min-h-screen">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Section 1: Việc làm đã ứng tuyển */}
            <section>
              <div className="flex items-end gap-4 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-primary leading-none font-headline">Việc làm đã ứng tuyển</h2>
                <div className="h-[2px] flex-1 bg-surface-container mb-1"></div>
                <span className="text-sm font-bold text-teal-600 uppercase tracking-widest pb-1">{appliedJobs.length} hồ sơ</span>
              </div>
              <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low">
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Tên công việc</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Công ty</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Ngày ứng tuyển</th>
                        <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {appliedJobs.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant">Chưa có công việc nào đã ứng tuyển.</td>
                        </tr>
                      ) : appliedJobs.map((app, index) => (
                        <tr key={index} className="hover:bg-surface-container-low transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/jobs/${app.postId || app.jobId || app.id}`)}>
                          <td className="px-6 py-6 font-semibold text-primary">{app.postTitle || app.jobTitle || app.title || "Vị trí ứng tuyển"}</td>
                          <td className="px-6 py-6 text-on-surface-variant">{app.companyName || user?.companyName || "Công ty"}</td>
                          <td className="px-6 py-6 text-on-surface-variant">{formatDate(app.applyDate || app.createdAt)}</td>
                          <td className="px-6 py-6 text-right">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === "APPROVED" ? "bg-green-100 text-green-700" :
                              app.status === "REJECTED" ? "bg-red-100 text-red-700" :
                              "bg-orange-100 text-orange-700"
                            }`}>
                              {app.status === "APPROVED" ? "Đã duyệt" : app.status === "REJECTED" ? "Từ chối" : "Đang xem xét"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Section 2: Việc làm đã lưu */}
            <section>
              <div className="flex items-end gap-4 mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-primary leading-none font-headline">Việc làm đã lưu</h2>
                <div className="h-[2px] flex-1 bg-surface-container mb-1"></div>
                <span className="text-sm font-bold text-teal-600 uppercase tracking-widest pb-1">{savedJobs.length} Việc làm</span>
              </div>
              
              {savedJobs.length === 0 ? (
                <div className="text-center py-10 bg-surface-container-lowest rounded-xl text-on-surface-variant">
                  Chưa có công việc nào được lưu.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedJobs.map((job, index) => (
                    <div key={index} className="group bg-surface-container-lowest p-6 rounded-xl hover:shadow-[0_20px_40px_rgba(0,32,69,0.06)] transition-all duration-300 relative border border-transparent hover:border-teal-100 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-14 h-14 bg-surface rounded-lg flex items-center justify-center p-2 overflow-hidden shadow-sm">
                          <img 
                            src={job.companyLogo || job.company?.logo || "https://via.placeholder.com/150"} 
                            alt="Company Logo" 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsave(job.id || job.postId);
                          }}
                          className="text-teal-600 bg-teal-50 p-2 rounded-full hover:bg-teal-600 hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
                        </button>
                      </div>
                      
                      <Link to={`/jobs/${job.id || job.postId}`} className="flex-1 cursor-pointer block group-hover:text-teal-700 transition-colors">
                        <h3 className="text-lg font-bold text-primary group-hover:text-teal-700 transition-colors mb-1 font-headline line-clamp-2">{job.title}</h3>
                        <p className="text-on-surface-variant text-sm mb-4 truncate">{job.companyName || job.company?.name}</p>
                      </Link>
                      
                      <div className="flex items-center gap-2 mb-6 mt-auto">
                        <span className="text-sm font-semibold text-teal-700">
                          {job.salary ? formatSalary(job.salary) : "Thoả thuận"}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleApply(job.id || job.postId)}
                        className="w-full bg-secondary text-on-secondary py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-primary-container transition-colors"
                      >
                        Ứng tuyển ngay
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
            
            {/* Asymmetric Quote Block / Editorial Accent */}
            <section className="relative py-12 px-12 bg-primary-container rounded-3xl overflow-hidden mt-12">
              <span className="material-symbols-outlined absolute -top-4 -left-4 text-9xl text-teal-500/20" style={{ fontVariationSettings: "'opsz' 48" }}>format_quote</span>
              <div className="relative z-10 max-w-3xl">
                <p className="text-2xl md:text-3xl text-surface-container-lowest font-headline font-bold leading-tight mb-4 italic">"Sự chuẩn bị kỹ lưỡng hôm nay là chìa khóa cho sự thành công vượt bậc của bạn vào ngày mai."</p>
                <p className="text-teal-300 font-semibold tracking-widest uppercase text-xs">Mẹo nghề nghiệp • JobMatch Editorial</p>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
            </section>
            
          </div>
        </main>
      </div>
    </div>
  );
}