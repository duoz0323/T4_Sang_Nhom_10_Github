import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyAPI, industryAPI } from '../../../services/api';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

import { generateMockCompanies } from '../../../utils/mockCompanyData';

export const MOCK_COMPANIES = [
  {
    companyProfileId: 'mock-1',
    companyName: 'FPT Software',
    email: 'hr@fpt.com.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=FPT+Software&background=0D8ABC&color=fff&size=200',
    description: 'Công ty phần mềm hàng đầu Việt Nam với hơn 30,000 nhân viên toàn cầu',
    address: '17 Duy Tân, Cầu Giấy, Hà Nội',
    industry: { nameIndustry: 'Công nghệ thông tin' },
    websiteURL: 'https://fptsoftware.com'
  },
  {
    companyProfileId: 'mock-2',
    companyName: 'Viettel Solutions',
    email: 'tuyendung@viettel.com.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=Viettel+Solutions&background=E74C3C&color=fff&size=200',
    description: 'Tập đoàn công nghiệp - viễn thông quân đội hàng đầu Việt Nam',
    address: 'Số 1 Giang Văn Minh, Ba Đình, Hà Nội',
    industry: { nameIndustry: 'Viễn thông' },
    websiteURL: 'https://viettelsolutions.vn'
  },
  {
    companyProfileId: 'mock-3',
    companyName: 'VNG Corporation',
    email: 'careers@vng.com.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=VNG+Corporation&background=F39C12&color=fff&size=200',
    description: 'Tập đoàn công nghệ hàng đầu Đông Nam Á',
    address: 'Z06, Đường số 13, Phường Tân Thuận Đông, Quận 7, TP.HCM',
    industry: { nameIndustry: 'Công nghệ thông tin' },
    websiteURL: 'https://vng.com.vn'
  },
  {
    companyProfileId: 'mock-4',
    companyName: 'Shopee Vietnam',
    email: 'recruitment@shopee.com',
    companyLogo: 'https://ui-avatars.com/api/?name=Shopee+Vietnam&background=EE4D2D&color=fff&size=200',
    description: 'Nền tảng thương mại điện tử hàng đầu Đông Nam Á',
    address: 'Tòa nhà Viettel, Số 285 Cách Mạng Tháng 8, Phường 12, Quận 10, TP.HCM',
    industry: { nameIndustry: 'Thương mại điện tử' },
    websiteURL: 'https://careers.shopee.vn'
  },
  {
    companyProfileId: 'mock-5',
    companyName: 'Tiki Corporation',
    email: 'career@tiki.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=Tiki+Corporation&background=1A94FF&color=fff&size=200',
    description: 'Công ty Thương mại điện tử hàng đầu Việt Nam',
    address: '52 Út Tịch, Phường 4, Quận Tân Bình, TP.HCM',
    industry: { nameIndustry: 'Thương mại điện tử' },
    websiteURL: 'https://tiki.vn/tuyen-dung'
  },
  {
    companyProfileId: 'mock-6',
    companyName: 'VinGroup',
    email: 'hr@vingroup.net',
    companyLogo: 'https://ui-avatars.com/api/?name=VinGroup&background=C0282D&color=fff&size=200',
    description: 'Tập đoàn kinh tế tư nhân đa ngành lớn nhất Việt Nam',
    address: '458 Minh Khai, Hai Bà Trưng, Hà Nội',
    industry: { nameIndustry: 'Đa ngành' },
    websiteURL: 'https://vingroup.net'
  },
  {
    companyProfileId: 'mock-7',
    companyName: 'Grab Vietnam',
    email: 'careers@grab.com',
    companyLogo: 'https://ui-avatars.com/api/?name=Grab+Vietnam&background=00B14F&color=fff&size=200',
    description: 'Nền tảng siêu ứng dụng hàng đầu Đông Nam Á',
    address: 'Tầng 6, Tòa nhà Centec, 72-74 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    industry: { nameIndustry: 'Công nghệ' },
    websiteURL: 'https://grab.careers'
  },
  {
    companyProfileId: 'mock-8',
    companyName: 'Momo E-Wallet',
    email: 'jobs@momo.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=Momo+Wallet&background=A50064&color=fff&size=200',
    description: 'Ví điện tử số 1 Việt Nam với hơn 30 triệu người dùng',
    address: 'Phòng 1901, Tầng 19, Tòa nhà Mê Linh Point, 02 Ngô Đức Kế, Quận 1, TP.HCM',
    industry: { nameIndustry: 'Fintech' },
    websiteURL: 'https://momo.vn'
  },
  {
    companyProfileId: 'mock-9',
    companyName: 'Be Group',
    email: 'careers@be.com.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=Be+Group&background=FFB800&color=000&size=200',
    description: 'Nền tảng công nghệ đa dịch vụ hàng đầu Việt Nam',
    address: 'Tầng 8, Tòa nhà HM Town, 412 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
    industry: { nameIndustry: 'Công nghệ' },
    websiteURL: 'https://be.com.vn'
  },
  {
    companyProfileId: 'mock-10',
    companyName: 'Sendo Technology',
    email: 'talent@sendo.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=Sendo+Tech&background=EE2624&color=fff&size=200',
    description: 'Sàn thương mại điện tử hàng đầu Việt Nam',
    address: 'Lầu 6, Tòa nhà E.Town Central, 11 Đoàn Văn Bơ, Quận 4, TP.HCM',
    industry: { nameIndustry: 'Thương mại điện tử' },
    websiteURL: 'https://sendo.vn'
  },
  {
    companyProfileId: 'mock-11',
    companyName: 'VNPay',
    email: 'hr@vnpay.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=VNPay&background=0066FF&color=fff&size=200',
    description: 'Công ty thanh toán điện tử hàng đầu Việt Nam',
    address: '22 Láng Hạ, Đống Đa, Hà Nội',
    industry: { nameIndustry: 'Fintech' },
    websiteURL: 'https://vnpay.vn'
  },
  {
    companyProfileId: 'mock-12',
    companyName: 'MoMo E-Wallet',
    email: 'recruitment@mservice.com.vn',
    companyLogo: 'https://ui-avatars.com/api/?name=MoMo&background=D82D8B&color=fff&size=200',
    description: 'Ví điện tử và nền tảng thanh toán hàng đầu Việt Nam',
    address: 'Phòng 1901, Lầu 19, Tòa nhà Mê Linh Point, 02 Ngô Đức Kế, Quận 1, TP.HCM',
    industry: { nameIndustry: 'Fintech' },
    websiteURL: 'https://momo.vn/tuyen-dung'
  }
];

const CompanyListPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const companiesPerPage = 6;

  useEffect(() => {
    fetchIndustries();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, selectedIndustry, searchKeyword]);

  const fetchIndustries = async () => {
    try {
      const cachedIndustries = sessionStorage.getItem('industries');
      if (cachedIndustries) {
        setIndustries(JSON.parse(cachedIndustries));
        return;
      }

      const response = await industryAPI.getAll();
      if (response?.data?.code === 1000 && response?.data?.result && response.data.result.length > 0) {
        setIndustries(response.data.result);
        sessionStorage.setItem('industries', JSON.stringify(response.data.result));
      } else {
        const mockInd = [
          { industryId: 1, nameIndustry: 'Công nghệ thông tin' },
          { industryId: 2, nameIndustry: 'Tài chính - Ngân hàng' },
          { industryId: 3, nameIndustry: 'Y tế - Sức khỏe' },
          { industryId: 4, nameIndustry: 'Sản xuất - Cơ khí' },
          { industryId: 5, nameIndustry: 'Giáo dục - Đào tạo' },
          { industryId: 6, nameIndustry: 'Kinh doanh - Bán hàng' }
        ];
        setIndustries(mockInd);
      }
    } catch (error) {
      console.error('Error fetching industries:', error);
      const mockInd = [
        { industryId: 1, nameIndustry: 'Công nghệ thông tin' },
        { industryId: 2, nameIndustry: 'Tài chính - Ngân hàng' },
        { industryId: 3, nameIndustry: 'Y tế - Sức khỏe' },
        { industryId: 4, nameIndustry: 'Sản xuất - Cơ khí' },
        { industryId: 5, nameIndustry: 'Giáo dục - Đào tạo' },
        { industryId: 6, nameIndustry: 'Kinh doanh - Bán hàng' }
      ];
      setIndustries(mockInd);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    
    try {
      const response = await companyAPI.getAllCompanies();
      if (response?.data?.code === 1000 && response?.data?.result && response.data.result.length > 0) {
        let companiesData = response.data.result;

        // Filter by keyword
        if (searchKeyword) {
          companiesData = companiesData.filter(company =>
            company.companyName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            company.description?.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }

        // Filter by industry
        if (selectedIndustry) {
          companiesData = companiesData.filter(company =>
            company.industry?.nameIndustry === selectedIndustry
          );
        }

        // --- DYNAMIC MOCK DATA INJECTION ---
        // If no companies found after filtering by industry, generate mock companies per user request
        if (companiesData.length === 0 && selectedIndustry) {
          companiesData = generateMockCompanies(selectedIndustry);
          // Apply keyword filter to the newly generated mock companies if needed
          if (searchKeyword) {
            companiesData = companiesData.filter(company =>
              company.companyName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
              company.description?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
          }
        }

        // Pagination
        const startIndex = currentPage * companiesPerPage;
        const endIndex = startIndex + companiesPerPage;
        const paginatedCompanies = companiesData.slice(startIndex, endIndex);

        console.log(`📄 Page ${currentPage + 1}: Showing ${paginatedCompanies.length} of ${companiesData.length} API companies`);

        setCompanies(paginatedCompanies);
        setTotalPages(Math.ceil(companiesData.length / companiesPerPage));
      } else {
        console.warn("⚠️ API returned no data, falling back to mock");
        fallbackToMock();
      }
    } catch (error) {
      console.error('❌ Error fetching companies:', error);
      console.warn("⚠️ API failed (maybe 401 Unauthorized), falling back to mock");
      fallbackToMock();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToMock = () => {
    let companiesData = [...MOCK_COMPANIES];

    // DYNAMIC MOCK: Make sure ALL known industries have some mock companies to display in "Tất cả"
    industries.forEach(ind => {
      // Check if we already have this industry in hardcoded mocks
      if (!companiesData.find(c => c.industry?.nameIndustry === ind.nameIndustry)) {
        companiesData = [...companiesData, ...generateMockCompanies(ind.nameIndustry)];
      }
    });

    // Filter by keyword
    if (searchKeyword) {
      const beforeFilter = companiesData.length;
      companiesData = companiesData.filter(company =>
        company.companyName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      console.log(`🔍 Keyword filter: ${beforeFilter} → ${companiesData.length} mock companies`);
    }

    // Filter by industry
    if (selectedIndustry) {
      const beforeFilter = companiesData.length;
      companiesData = companiesData.filter(company =>
        company.industry?.nameIndustry === selectedIndustry
      );
      
      // DYNAMIC MOCK DATA INJECTION
      // If none of our hardcoded mocks matched the selected industry, dynamically generate them!
      if (companiesData.length === 0) {
        companiesData = generateMockCompanies(selectedIndustry);
        if (searchKeyword) {
          companiesData = companiesData.filter(company =>
            company.companyName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            company.description?.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }
      }
      
      console.log(`🏭 Industry filter: ${beforeFilter} → ${companiesData.length} mock companies`);
    }

    // Pagination
    const startIndex = currentPage * companiesPerPage;
    const endIndex = startIndex + companiesPerPage;
    const paginatedCompanies = companiesData.slice(startIndex, endIndex);

    console.log(`📄 Page ${currentPage + 1}: Showing ${paginatedCompanies.length} of ${companiesData.length} mock companies`);

    setCompanies(paginatedCompanies);
    setTotalPages(Math.ceil(companiesData.length / companiesPerPage));
  };

  const getMockCompanies = () => {
    return [
      {
        companyProfileId: '1',
        companyName: 'TechNova Solutions',
        description: 'Công ty công nghệ hàng đầu chuyên về AI và Machine Learning',
        address: 'TP. Hồ Chí Minh',
        email: 'contact@technova.com',
        phoneNumber: '+84 28 1234 5678',
        avatar: 'https://ui-avatars.com/api/?name=TechNova+Solutions&background=1E40AF&color=fff&size=128'
      },
      {
        companyProfileId: '2',
        companyName: 'VietFinance Group',
        description: 'Tập đoàn tài chính và ngân hàng uy tín tại Việt Nam',
        address: 'Hà Nội',
        email: 'hr@vietfinance.vn',
        phoneNumber: '+84 24 9876 5432',
        avatar: 'https://ui-avatars.com/api/?name=VietFinance+Group&background=059669&color=fff&size=128'
      },
      {
        companyProfileId: '3',
        companyName: 'E-Commerce Hub',
        description: 'Nền tảng thương mại điện tử lớn nhất Đông Nam Á',
        address: 'TP. Hồ Chí Minh',
        email: 'careers@ecomhub.com',
        phoneNumber: '+84 28 5555 6666',
        avatar: 'https://ui-avatars.com/api/?name=E-Commerce+Hub&background=DC2626&color=fff&size=128'
      },
      {
        companyProfileId: '4',
        companyName: 'Green Energy Vietnam',
        description: 'Tiên phong trong giải pháp năng lượng tái tạo và bền vững',
        address: 'Đà Nẵng',
        email: 'info@greenenergy.vn',
        phoneNumber: '+84 236 7777 8888',
        avatar: 'https://ui-avatars.com/api/?name=Green+Energy&background=16A34A&color=fff&size=128'
      },
      {
        companyProfileId: '5',
        companyName: 'HealthCare Plus',
        description: 'Hệ thống y tế và chăm sóc sức khỏe toàn diện',
        address: 'Hà Nội',
        email: 'recruitment@healthcare.vn',
        phoneNumber: '+84 24 3333 4444',
        avatar: 'https://ui-avatars.com/api/?name=HealthCare+Plus&background=7C3AED&color=fff&size=128'
      },
      {
        companyProfileId: '6',
        companyName: 'EduTech Innovation',
        description: 'Đổi mới giáo dục với công nghệ hiện đại và sáng tạo',
        address: 'TP. Hồ Chí Minh',
        email: 'jobs@edutech.vn',
        phoneNumber: '+84 28 2222 3333',
        avatar: 'https://ui-avatars.com/api/?name=EduTech+Innovation&background=EA580C&color=fff&size=128'
      },
      {
        companyProfileId: '7',
        companyName: 'Smart Logistics Co.',
        description: 'Giải pháp logistics thông minh và vận chuyển toàn cầu',
        address: 'Hải Phòng',
        email: 'contact@smartlogistics.vn',
        phoneNumber: '+84 225 8888 9999',
        avatar: 'https://ui-avatars.com/api/?name=Smart+Logistics&background=0891B2&color=fff&size=128'
      },
      {
        companyProfileId: '8',
        companyName: 'Creative Media Agency',
        description: 'Agency sáng tạo hàng đầu về marketing và truyền thông',
        address: 'TP. Hồ Chí Minh',
        email: 'creative@mediahub.vn',
        phoneNumber: '+84 28 4444 5555',
        avatar: 'https://ui-avatars.com/api/?name=Creative+Media&background=EC4899&color=fff&size=128'
      },
      {
        companyProfileId: '9',
        companyName: 'FoodTech Ventures',
        description: 'Khởi nghiệp công nghệ thực phẩm và F&B hiện đại',
        address: 'Hà Nội',
        email: 'careers@foodtech.vn',
        phoneNumber: '+84 24 6666 7777',
        avatar: 'https://ui-avatars.com/api/?name=FoodTech+Ventures&background=F59E0B&color=fff&size=128'
      },
      {
        companyProfileId: '10',
        companyName: 'Real Estate Pro',
        description: 'Tập đoàn bất động sản và phát triển đô thị bền vững',
        address: 'Cần Thơ',
        email: 'info@realestatepro.vn',
        phoneNumber: '+84 292 1111 2222',
        avatar: 'https://ui-avatars.com/api/?name=Real+Estate+Pro&background=8B5CF6&color=fff&size=128'
      },
      {
        companyProfileId: '11',
        companyName: 'Auto Manufacturing Ltd',
        description: 'Sản xuất ô tô và linh kiện công nghệ cao',
        address: 'Bình Dương',
        email: 'hr@automanufacturing.vn',
        phoneNumber: '+84 274 3333 4444',
        avatar: 'https://ui-avatars.com/api/?name=Auto+Manufacturing&background=374151&color=fff&size=128'
      },
      {
        companyProfileId: '12',
        companyName: 'Fashion Forward Group',
        description: 'Tập đoàn thời trang và retail hàng đầu Việt Nam',
        address: 'TP. Hồ Chí Minh',
        email: 'jobs@fashionforward.vn',
        phoneNumber: '+84 28 7777 8888',
        avatar: 'https://ui-avatars.com/api/?name=Fashion+Forward&background=DB2777&color=fff&size=128'
      }
    ];
  };

  const handleSearch = () => {
    setCurrentPage(0);
    fetchCompanies();
  };

  const handleIndustryFilter = (industryName) => {
    setSelectedIndustry(industryName === selectedIndustry ? '' : industryName);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRandomJobCount = () => Math.floor(Math.random() * 40) + 5;
  
  const getDefaultLogo = (companyName) => {
    const name = companyName || 'Company';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fb]">
      <Header />

      <main className="pt-32 pb-24 px-8 max-w-7xl mx-auto w-full">
        {/* Hero/Header Section */}
        <header className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[#13696a] font-semibold tracking-widest text-xs uppercase mb-4 block">
                Khám phá Cơ hội
              </span>
              <h1 className="text-5xl font-extrabold tracking-tighter text-[#002045] mb-6 leading-tight font-headline">
                Những Đối tác Tuyển dụng Hàng đầu
              </h1>
              <p className="text-[#43474e] text-lg leading-relaxed max-w-xl">
                Kết nối với những doanh nghiệp hàng đầu đang định hình tương lai. 
                Từ các tập đoàn đa quốc gia đến các startup kỳ lân, hãy tìm nơi bạn thuộc về.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-w-75">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#43474e]">
                  search
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 bg-[#e0e3e5] border-none rounded-md 
                           focus:ring-0 focus:bg-white transition-all duration-300 text-sm"
                  placeholder="Tìm kiếm công ty..."
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setCurrentPage(0); // Reset to first page on search
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(0);
                      fetchCompanies();
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Filters Chips */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button
            onClick={() => handleIndustryFilter('')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedIndustry === ''
                ? 'bg-[#a2eded] text-[#1a6d6e]'
                : 'bg-[#eceef0] text-[#43474e] hover:bg-[#e6e8ea]'
            }`}
          >
            Tất cả
          </button>
          {industries.map((industry) => (
            <button
              key={industry.industryId}
              onClick={() => handleIndustryFilter(industry.nameIndustry)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedIndustry === industry.nameIndustry
                  ? 'bg-[#a2eded] text-[#1a6d6e]'
                  : 'bg-[#eceef0] text-[#43474e] hover:bg-[#e6e8ea]'
              }`}
            >
              {industry.nameIndustry}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white p-8 rounded-xl">
                <div className="flex items-start justify-between mb-8">
                  <div className="w-16 h-16 bg-[#e6e8ea] rounded-xl"></div>
                  <div className="h-6 w-20 bg-[#e6e8ea] rounded-full"></div>
                </div>
                <div className="h-6 bg-[#e6e8ea] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-[#e6e8ea] rounded w-full mb-6"></div>
                <div className="h-4 bg-[#e6e8ea] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Company Grid - All Cards Same Size */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {companies.map((company) => (
                <CompanyCard
                  key={company.companyProfileId}
                  company={company}
                  onViewDetails={() => navigate(`/companies/${company.companyProfileId}`, { 
                    state: { company } 
                  })}
                />
              ))}
            </div>

            {/* Empty State */}
            {!loading && companies.length === 0 && (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-[#c4c6cf] mb-4">
                  business
                </span>
                <h3 className="text-xl font-bold text-[#43474e] mb-2">
                  Không tìm thấy công ty nào
                </h3>
                <p className="text-[#74777f]">
                  Thử điều chỉnh bộ lọc hoặc tìm kiếm khác
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#eceef0] 
                           text-[#43474e] hover:bg-[#e6e8ea] transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  if (
                    index === 0 ||
                    index === totalPages - 1 ||
                    (index >= currentPage - 1 && index <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => handlePageChange(index)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-all ${
                          currentPage === index
                            ? 'bg-[#13696a] text-white font-bold'
                            : 'bg-white text-[#43474e] hover:bg-[#eceef0]'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (index === currentPage - 2 || index === currentPage + 2) {
                    return (
                      <span key={index} className="mx-2 text-[#43474e]">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#eceef0] 
                           text-[#43474e] hover:bg-[#e6e8ea] transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

// Company Card Component - ALL CARDS SAME SIZE
const CompanyCard = ({ company, onViewDetails }) => {
  const [jobCount] = useState(() => Math.floor(Math.random() * 40) + 5);
  const getLogoUrl = (company) => {
    if (company.avatar || company.logo) {
      return company.avatar || company.logo;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(company.companyName)}&background=random&color=fff&size=128`;
  };
  const logo = getLogoUrl(company);
  
  return (
    <div className="group relative bg-white p-8 rounded-xl transition-all duration-500 
                  hover:shadow-[0_20px_40px_rgba(0,32,69,0.06)] overflow-hidden">
      <div className="flex items-start justify-between mb-8">
        <div className="w-16 h-16 rounded-xl bg-[#e6e8ea] flex items-center justify-center p-3">
          <img
            alt={company.companyName}
            className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 
                     transition-all duration-500"
            src={logo}
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.companyName)}&background=random&color=fff&size=128`;
            }}
          />
        </div>
        <span className="bg-[#a2eded]/30 text-[#1a6d6e] px-3 py-1 rounded-full text-xs 
                       font-bold tracking-tight">
          {jobCount} Vị trí mở
        </span>
      </div>
      <h3 className="text-xl font-bold text-[#002045] mb-2 group-hover:text-[#13696a] 
                   transition-colors font-headline">
        {company.companyName}
      </h3>
      <p className="text-[#43474e] text-sm mb-6 line-clamp-2">
        {company.description || 'Công ty hàng đầu trong lĩnh vực của mình.'}
      </p>
      <div className="flex items-center gap-4 text-xs font-semibold text-[#43474e] mb-8">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {company.address || 'Việt Nam'}
        </div>
      </div>
      <div className="pt-6 border-t border-[#e6e8ea] flex items-center justify-between">
        <span className="text-xs text-[#43474e] italic">Đang tuyển dụng</span>
        <button
          onClick={onViewDetails}
          className="text-[#13696a] font-bold text-sm flex items-center gap-1 
                   group-hover:translate-x-1 transition-transform"
        >
          Xem chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default CompanyListPage;
