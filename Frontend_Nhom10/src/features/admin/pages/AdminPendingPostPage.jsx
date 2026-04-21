import React, { useState, useEffect, useRef } from 'react';
import { jobAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { toast } from 'sonner';
import Dialog from '../../../components/ui/Dialog';

const formatSalary = (salary) => {
  if (!salary) return '-';

  const value = Number(salary);
  if (Number.isNaN(value) || value <= 0) return '-';

  if (value >= 1000000) {
    return `${Math.round(value / 1000000)} triệu VND`;
  }

  return `${value} VND`;
};
const normalizePost = (post = {}) => {
  const locationFromArray = Array.isArray(post.locations)
    ? post.locations
      .map((loc) => loc?.city || loc?.name || loc?.province)
      .filter(Boolean)
      .join(', ')
    : '';
  const normalizedSkills = Array.isArray(post.skills)
    ? post.skills
      .map((skill) => (typeof skill === 'string' ? skill : skill?.name || skill?.skillName))
      .filter(Boolean)
    : [];
  return {
    ...post,
    postId: post.postId || post.jobPostingId || post.id,
    companyName: post.companyName || post.companyProfile?.companyName || '-',
    location: post.location || locationFromArray || '-',
    salary: post.salary || formatSalary(post.salaryRequire),
    level: post.level || post.experienceLevel || post.position || '-',
    jobType: post.jobType || post.workingFormat || '-',
    createdDate: post.createdDate || post.createdAt,
    skills: normalizedSkills,
  };
};
const AdminPendingPostPage = () => {
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const contentRef = useRef(null);

  // Fetch danh sách tin tuyển dụng chờ kiểm duyệt
  const fetchPendingPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await jobAPI.getPendingJobs();

      if (response.data?.code === 1000) {
        const result = response.data.result;
        let posts = [];

        if (Array.isArray(result)) {
          posts = result;
        } else if (result?.content) {
          posts = result.content;
        }

        setPendingPosts(posts.map(normalizePost));
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách: ' + (err.message || 'Lỗi không xác định'));
      setPendingPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click vào dòng
  const handleRowClick = (post) => {
    setSelectedPost(post);
    setIsDialogOpen(true);
  };
  const handleUpdateStatus = async (status) => {
    if (!selectedPost) return;

    const postId = selectedPost.postId || selectedPost.jobPostingId || selectedPost.id;
    if (!postId) {
      toast.error('Không tìm thấy ID bài đăng');
      return;
    }

    try {
      setActionLoading(true);
      await jobAPI.updateJobStatus(postId, status);

      toast.success(status === 'ACTIVE' ? 'Đã phê duyệt bài đăng' : 'Đã từ chối bài đăng');

      setPendingPosts((prev) => prev.filter((p) => {
        const id = p.postId || p.jobPostingId || p.id;
        return id !== postId;
      }));

      setIsDialogOpen(false);
      setSelectedPost(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Cập nhật trạng thái thất bại';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchPendingPosts();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <Header />

      <div className="flex flex-1 pt-16">
        <AdminSidebar />

        <main className="flex-1 flex flex-col bg-surface overflow-hidden">
          {/* Fixed Header */}
          <div className="p-8 flex-shrink-0">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">📋 Kiểm duyệt tin tuyển dụng</h1>
                <p className="text-on-surface-variant">Danh sách các tin tuyển dụng chờ phê duyệt</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-8 pt-6"
            style={{ overscrollBehavior: 'contain' }}
          >
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : pendingPosts.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-outline-variant text-center">
                  <p className="text-on-surface-variant">Không có tin tuyển dụng nào chờ kiểm duyệt</p>
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  <div className="mb-4 text-sm text-on-surface-variant">
                    Có <span className="font-semibold text-primary">{pendingPosts.length}</span> tin chờ kiểm duyệt
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-lg border border-outline-variant shadow-sm mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-surface border-b border-outline sticky top-0 z-10">
                          <tr>
                            <th className="w-1/4 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Tiêu đề</th>
                            <th className="w-1/5 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Công ty</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Địa điểm</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Lương</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Ngày đăng</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                          <tbody className="divide-y divide-outline">
                            {pendingPosts.map((post) => (
                              <tr
                                key={post.postId}
                                onClick={() => handleRowClick(post)}
                                className="hover:bg-surface transition-colors border-b border-outline cursor-pointer"
                              >
                                <td className="w-1/4 px-6 py-4">
                                  <span className="font-medium truncate block">{post.title || '-'}</span>
                                </td>
                                <td className="w-1/5 px-6 py-4 text-sm truncate">{post.companyName || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{post.location || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{post.salary || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">
                                  {post.createdDate ? new Date(post.createdDate).toLocaleDateString('vi-VN') : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Dialog Chi tiết tin tuyển dụng */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedPost(null);
        }}
        title="Chi tiết tin tuyển dụng"
      >
        {selectedPost ? (
          <div className="space-y-4">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{selectedPost.title}</h3>
              <p className="text-sm text-gray-500">{selectedPost.companyName}</p>
            </div>

            <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
              <div>
                <label className="font-semibold text-gray-700">Tiêu đề:</label>
                <p className="text-gray-600">{selectedPost.title || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Công ty:</label>
                <p className="text-gray-600">{selectedPost.companyName || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Địa điểm:</label>
                <p className="text-gray-600">{selectedPost.location || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Lương:</label>
                <p className="text-gray-600">{selectedPost.salary || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Cấp độ:</label>
                <p className="text-gray-600">{selectedPost.level || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Loại công việc:</label>
                <p className="text-gray-600">{selectedPost.jobType || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Mô tả công việc:</label>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedPost.description || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Yêu cầu:</label>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedPost.requirements || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Kỹ năng:</label>
                <p className="text-gray-600"> {selectedPost.skills && selectedPost.skills.length > 0 ? selectedPost.skills.join(', ') : '-'} </p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Ngày đăng:</label>
                <p className="text-gray-600">
                  {selectedPost.createdDate ? new Date(selectedPost.createdDate).toLocaleDateString('vi-VN') : '-'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => handleUpdateStatus('ACTIVE')}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Đang xử lý...' : '✓ Phê duyệt'}
              </button>
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Đang xử lý...' : '✕ Từ chối'}
              </button>
            </div>
          </div>
        ) : null}
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminPendingPostPage;
