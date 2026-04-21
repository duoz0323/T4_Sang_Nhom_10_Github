import React, { useState, useEffect, useRef } from 'react';
import { companyAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Dialog from '../../../components/ui/Dialog';

const normalizeCompany = (company = {}) => {
  return {
    ...company,
    companyId: company.companyProfileId || company.id,
    companyName: company.companyName || '-',
    email: company.email || '-',
    phoneNumber: company.phoneNumber || '-',
    address: company.address || '-',
    tax: company.tax || '-',
    avatar:
      company.avatar ||
      company.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(company.companyName || 'Company')}&background=random&color=fff`,
    isActive: typeof company.status === 'boolean' ? company.status : true,
  };
};

const AdminCompanyPage = () => {
  const [allCompanies, setAllCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const contentRef = useRef(null);

  const fetchAllCompanies = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await companyAPI.getAllCompanies();

      if (response.data?.code === 1000 || response.data?.result) {
        const result = response.data.result;
        let companies = [];

        if (Array.isArray(result)) {
          companies = result;
        } else if (result?.content) {
          companies = result.content;
        }

        const normalized = companies.map(normalizeCompany);
        setAllCompanies(normalized);
        setFilteredCompanies(normalized);
      }
    } catch (err) {
      setError('Loi khi tai danh sach: ' + (err.message || 'Loi khong xac dinh'));
      setAllCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchAllCompanies();
  }, []);

  useEffect(() => {
    if (!searchKeyword.trim()) {
      setFilteredCompanies(allCompanies);
      return;
    }

    const keyword = searchKeyword.toLowerCase();
    const filtered = allCompanies.filter((company) =>
      company.companyName?.toLowerCase().includes(keyword) ||
      company.email?.toLowerCase().includes(keyword) ||
      company.phoneNumber?.toLowerCase().includes(keyword) ||
      company.address?.toLowerCase().includes(keyword) ||
      company.tax?.toLowerCase().includes(keyword)
    );
    setFilteredCompanies(filtered);
  }, [searchKeyword, allCompanies]);

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      <Header />

      <div className="flex flex-1 pt-16">
        <AdminSidebar />

        <main className="flex-1 flex flex-col bg-surface overflow-hidden">
          <div className="p-8 flex-shrink-0">
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Quản lý doanh nghiệp</h1>
                <p className="text-on-surface-variant">Danh sách tất cả doanh nghiệp trong hệ thống</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-white p-6 rounded-lg border border-outline-variant shadow-sm">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên công ty, email, SDT..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="flex-1 px-4 py-2 border border-outline rounded-lg focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="px-6 py-2 bg-outline text-on-outline rounded-lg hover:bg-outline-variant"
                  >
                    Xóa lọc
                  </button>
                </div>
              </div>
            </div>
          </div>

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
              ) : filteredCompanies.length === 0 ? (
                <div className="bg-white p-12 rounded-lg border border-outline-variant text-center">
                  <p className="text-on-surface-variant">
                    {searchKeyword ? `Khong tim thay doanh nghiep voi "${searchKeyword}"` : 'Khong co doanh nghiep nao'}
                  </p>
                </div>
              ) : (
                <>
                  {searchKeyword && (
                    <div className="mb-4 text-sm text-on-surface-variant">
                      Tim thay <span className="font-semibold text-primary">{filteredCompanies.length}</span> ket qua cho "{searchKeyword}"
                    </div>
                  )}

                  <div className="bg-white rounded-lg border border-outline-variant shadow-sm mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-surface border-b border-outline sticky top-0 z-10">
                          <tr>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Tên công ty</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Email</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Điện thoại</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Địa chỉ</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Mã số thuế</th>
                            <th className="w-1/6 px-6 py-3 text-left text-sm font-semibold border-b border-outline">Trạng thái</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                          <tbody className="divide-y divide-outline">
                            {filteredCompanies.map((company) => (
                              <tr
                                key={company.companyId}
                                onClick={() => handleRowClick(company)}
                                className="hover:bg-surface transition-colors border-b border-outline cursor-pointer"
                              >
                                <td className="w-1/6 px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={company.avatar}
                                      alt={company.companyName}
                                      className="w-10 h-10 rounded-full"
                                    />
                                    <span className="font-medium truncate">{company.companyName}</span>
                                  </div>
                                </td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{company.email}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{company.phoneNumber}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{company.address}</td>
                                <td className="w-1/6 px-6 py-4 text-sm truncate">{company.tax}</td>
                                <td className="w-1/6 px-6 py-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      company.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {company.isActive ? 'Hoạt động' : 'Bị khóa'}
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

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedCompany(null);
        }}
        title="Thong tin doanh nghiep"
      >
        {selectedCompany ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedCompany.avatar}
                alt={selectedCompany.companyName}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedCompany.companyName}</h3>
                <p className="text-sm text-gray-500">{selectedCompany.email}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="font-semibold text-gray-700">Tên công ty:</label>
                <p className="text-gray-600">{selectedCompany.companyName}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Email:</label>
                <p className="text-gray-600">{selectedCompany.email}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Điện thoại:</label>
                <p className="text-gray-600">{selectedCompany.phoneNumber}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Địa chỉ:</label>
                <p className="text-gray-600">{selectedCompany.address}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Mã số thuế:</label>
                <p className="text-gray-600">{selectedCompany.tax}</p>
              </div>
              <div>
                <label className="font-semibold text-gray-700">Trạng thái:</label>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCompany.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {selectedCompany.isActive ? 'Hoạt động' : 'Bị khóa'}
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

export default AdminCompanyPage;