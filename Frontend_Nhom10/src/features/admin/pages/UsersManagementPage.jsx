import { useState, useEffect } from 'react';
import { jobAPI } from '../../../services/api';
import { ensureAuthenticated } from '../../../services/guestAuth';
import { useAuth } from '../../../contexts/AuthContext';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';

const UsersManagementPage = () => {
  const { user } = useAuth();
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(null); // Track which job is being processed

  useEffect(() => {
    fetchPendingJobs();
  }, []);

  const fetchPendingJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching pending jobs for approval...');

      await ensureAuthenticated();

      const response = await jobAPI.getPendingJobs();
      console.log('📋 Pending jobs response:', response);

      if (response?.data?.result) {
        setPendingJobs(response.data.result || []);
      } else {
        setPendingJobs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching pending jobs:', err);
      setError('Không thể tải danh sách tin tuyển dụng chờ duyệt');
      setPendingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt tin tuyển dụng này?')) {
      return;
    }

    try {
      setProcessing(jobId);
      console.log('✅ Approving job:', jobId);

      const response = await jobAPI.updateJobStatus(jobId, 'ACTIVE');
      console.log('✅ Approval response:', response);

      if (response?.data?.result || response?.data?.code === 1000) {
        alert('✅ Tin tuyển dụng đã được duyệt thành công!');
        // Làm mới danh sách
        await fetchPendingJobs();
      } else {
        throw new Error(response?.data?.message || 'Duyệt thất bại');
      }
    } catch (err) {
      console.error('❌ Error approving job:', err);
      alert(`❌ ${err.message || 'Có lỗi xảy ra khi duyệt'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (jobId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối tin tuyển dụng này?')) {
      return;
    }

    try {
      setProcessing(jobId);
      console.log('❌ Rejecting job:', jobId);

      const response = await jobAPI.updateJobStatus(jobId, 'REJECTED');
      console.log('❌ Rejection response:', response);

      if (response?.data?.result || response?.data?.code === 1000) {
        alert('✅ Tin tuyển dụng đã bị từ chối!');
        // Làm mới danh sách
        await fetchPendingJobs();
      } else {
        throw new Error(response?.data?.message || 'Từ chối thất bại');
      }
    } catch (err) {
      console.error('❌ Error rejecting job:', err);
      alert(`❌ ${err.message || 'Có lỗi xảy ra khi từ chối'}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Header />
        <div className="flex flex-1 pt-16">
          <AdminSidebar />
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
      {/* Header */}
      <Header />

      {/* Content with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 bg-surface overflow-y-auto">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">🔍 Duyệt Tin Tuyển Dụng</h1>
          <p className="text-on-surface-variant">Quản lý các tin tuyển dụng chờ phê duyệt ({pendingJobs.length})</p>
          {error && (
            <div className="mt-4 p-4 bg-error-container text-on-error-container rounded-lg">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Jobs Table/List */}
        <div className="bg-white rounded-xl border border-outline-variant shadow-sm overflow-hidden">
          {pendingJobs.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">done_all</span>
              <p className="text-on-surface-variant text-lg">Không có tin tuyển dụng nào chờ duyệt</p>
              <p className="text-on-surface-variant text-sm mt-2">Tất cả tin đã được xử lý</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Vị trí</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Công ty</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Địa điểm</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Mức lương</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-on-surface">Trạng thái</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-on-surface">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {pendingJobs.map(job => (
                    <tr key={job.jobPostingId} className="hover:bg-surface-container/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-on-surface">{job.title}</p>
                          <p className="text-xs text-on-surface-variant">ID: {job.jobPostingId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-on-surface">{job.companyProfile?.companyName || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-on-surface">
                          {job.locations?.map(l => l.city).join(', ') || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-on-surface font-medium">
                          {job.salaryRequire ? `${(job.salaryRequire / 1000000).toFixed(1)}M VNĐ` : 'Thỏa thuận'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-error-container text-on-error-container">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(job.jobPostingId)}
                            disabled={processing === job.jobPostingId}
                            className="px-4 py-2 bg-secondary text-on-secondary text-sm font-bold rounded-lg hover:bg-on-secondary-container disabled:opacity-50 transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(job.jobPostingId)}
                            disabled={processing === job.jobPostingId}
                            className="px-4 py-2 bg-error text-on-error text-sm font-bold rounded-lg hover:bg-error-container disabled:opacity-50 transition-all flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats */}
        {pendingJobs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-error">schedule</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-primary">{pendingJobs.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary">work</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Tổng vị trí</p>
                  <p className="text-2xl font-bold text-primary">
                    {pendingJobs.reduce((sum, job) => sum + (job.locations?.length || 1), 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-container rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">apartment</span>
                </div>
                <div>
                  <p className="text-sm text-on-surface-variant">Công ty</p>
                  <p className="text-2xl font-bold text-primary">
                    {new Set(pendingJobs.map(j => j.companyProfile?.companyProfileId)).size}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default UsersManagementPage;
