import React, { useState, useEffect, useRef } from 'react';
import { candidateAPI, companyAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Dialog from '../../../components/ui/Dialog';

const AdminUserPage = () => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const contentRef = useRef(null);

  // Fetch toàn bộ danh sách ứng viên lần đầu
  const fetchAllCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await candidateAPI.getAllCandidates({ size: 1000 });
      
      if (response.data?.code === 1000) {
        const result = response.data.result;
        let candidates = [];
        
        if (Array.isArray(result)) {
          candidates = result;
        } else if (result?.content) {
          candidates = result.content;
        }
        
        setAllCandidates(candidates);
        setFilteredCandidates(candidates);
      }
    } catch (err) {
      setError('Lỗi khi tải danh sách: ' + (err.message || 'Lỗi không xác định'));
      setAllCandidates([]);
      setFilteredCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý click vào dòng
  const handleRowClick = (candidate) => {
    console.log('Candidate data:', candidate); // Debug
    // Tạm thời lấy thông tin ứng viên thay vì công ty
    setSelectedProfile(candidate);
    setIsDialogOpen(true);
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchAllCandidates();
  }, []);

  // Lọc danh sách khi search keyword thay đổi
  useEffect(() => {
    if (!searchKeyword.trim()) {
      // Nếu search trống, hiển thị toàn bộ
      setFilteredCandidates(allCandidates);
    } else {
      // Lọc theo tên hoặc email (không phân biệt chữ hoa/thường)
      const keyword = searchKeyword.toLowerCase();
      const filtered = allCandidates.filter(candidate =>
        candidate.fullName?.toLowerCase().includes(keyword) ||
        candidate.email?.toLowerCase().includes(keyword)
      );
      setFilteredCandidates(filtered);
    }
  }, [searchKeyword, allCandidates]);

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
                <h1 className="text-3xl font-bold text-primary mb-2">👥 Quản lý Ứng viên</h1>
                <p className="text-on-surface-variant">Danh sách tất cả ứng viên trong hệ thống</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  ⚠️ {error}
                </div>
              )}

              {/* Search */}
              <div className="bg-white p-6 rounded-lg border border-outline-variant shadow-sm">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="px-6 py-2 bg-outline text-on-outline rounded-lg hover:bg-outline-variant"
                  >
                    Tìm Kiếm
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content with Chained Scrolling */}
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
              ) : filteredCandidates.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-outline-variant text-center">
                  <p className="text-on-surface-variant">
                    {searchKeyword ? `Không tìm thấy ứng viên với "${searchKeyword}"` : 'Không có ứng viên nào'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Results Summary */}
                  {searchKeyword && (
                    <div className="mb-4 text-sm text-on-surface-variant">
                      Tìm thấy <span className="font-semibold text-primary">{filteredCandidates.length}</span> kết quả cho "{searchKeyword}"
                    </div>
                  )}

                  {/* Table */}
                  <div className="bg-white rounded-lg border border-outline-variant shadow-sm mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-surface border-b border-outline sticky top-0 z-10">
                          <tr>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Tên</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Email</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Điện thoại</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Địa chỉ</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Vị trí</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Trạng thái</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                          <tbody className="divide-y divide-outline">
                            {filteredCandidates.map((candidate) => (
                              <tr 
                                key={candidate.candidateProfileId} 
                                onClick={() => handleRowClick(candidate)}
                                className="hover:bg-surface transition-colors border-b border-outline cursor-pointer"
                              >
                                <td className="w-1/6 px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={candidate.avatar || `https://ui-avatars.com/api/?name=${candidate.fullName}`}
                                      alt={candidate.fullName}
                                      className="w-10 h-10 rounded-full"
                                    />
                                    <span className="font-medium truncate">{candidate.fullName}</span>
                                  </div>
                                </td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{candidate.email || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{candidate.phoneNumber || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{candidate.address || '-'}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{candidate.currentJobTitle || '-'}</td>
                                <td className="w-1/6 px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    candidate.status
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {candidate.status ? 'Hoạt động' : 'Bị khóa'}
                                  </span>
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

      {/* Dialog Thông tin ứng viên */}
      <Dialog 
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedProfile(null);
        }}
        title="Thông tin ứng viên"
      >
        {selectedProfile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedProfile.avatar || `https://ui-avatars.com/api/?name=${selectedProfile.fullName}`}
                alt={selectedProfile.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedProfile.fullName}</h3>
                <p className="text-sm text-gray-500">{selectedProfile.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="font-semibold text-gray-700">Tên:</label>
                <p className="text-gray-600">{selectedProfile.fullName || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Email:</label>
                <p className="text-gray-600">{selectedProfile.email || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Điện thoại:</label>
                <p className="text-gray-600">{selectedProfile.phoneNumber || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Địa chỉ:</label>
                <p className="text-gray-600">{selectedProfile.address || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Vị trí hiện tại:</label>
                <p className="text-gray-600">{selectedProfile.currentJobTitle || '-'}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Trạng thái:</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  selectedProfile.status
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {selectedProfile.status ? 'Hoạt động' : 'Bị khóa'}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminUserPage;
