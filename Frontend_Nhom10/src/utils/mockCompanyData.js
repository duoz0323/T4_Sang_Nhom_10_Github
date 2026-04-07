// Mock generator
export const generateMockCompanies = (industryName) => {
  if (!industryName) return [];
  
  const formattedName = industryName.toLowerCase().replace(/[\s,]+/g, '');
  
  return [
    {
      companyProfileId: `mock-${formattedName}-1`,
      companyName: `Công ty ${industryName} Tiên Phong`,
      email: `contact@${formattedName}-corp.vn`,
      companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(industryName)}&background=0D8ABC&color=fff&size=200`,
      description: `Một trong những công ty hàng đầu trong lĩnh vực ${industryName} tại Việt Nam với sứ mệnh mang đến giải pháp tối ưu nhất.`,
      address: 'Tòa nhà văn phòng, Trung tâm thành phố, Hà Nội',
      industry: { nameIndustry: industryName },
      websiteURL: `https://${formattedName}-corp.vn`
    },
    {
      companyProfileId: `mock-${formattedName}-2`,
      companyName: `Tập đoàn ${industryName} Toàn Cầu`,
      email: `hr@${formattedName}-global.com`,
      companyLogo: `https://ui-avatars.com/api/?name=Global+${encodeURIComponent(industryName)}&background=F39C12&color=fff&size=200`,
      description: `Tập đoàn đa quốc gia chuyên phân phối và cung cấp các dịch vụ chuyên nghiệp về ${industryName}.`,
      address: 'Khu công nghệ cao, TP.HCM',
      industry: { nameIndustry: industryName },
      websiteURL: `https://${formattedName}-global.vn`
    },
    {
      companyProfileId: `mock-${formattedName}-3`,
      companyName: `Doanh nghiệp ${industryName} Sáng Tạo`,
      email: `hr@${formattedName}-innovation.vn`,
      companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(industryName)}+Innovation&background=E74C3C&color=fff&size=200`,
      description: `Doanh nghiệp đổi mới sáng tạo, áp dụng công nghệ vào lĩnh vực ${industryName}.`,
      address: 'Đường Nguyễn Văn Linh, Đà Nẵng',
      industry: { nameIndustry: industryName },
      websiteURL: `https://${formattedName}-innovation.vn`
    }
  ];
};

export const getMockCompanyById = (id, industryName = 'Ngành mặc định') => {
  if (id && id.startsWith('mock-')) {
    // If we have stored it or can extract from ID
    const nameStr = id.split('-')[1] || industryName;
    return {
      companyProfileId: id,
      companyName: `Công ty ${nameStr.toUpperCase()} (Mock)`,
      email: `contact@${nameStr}-corp.vn`,
      companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(nameStr)}&background=random&color=fff&size=200`,
      description: `Thông tin chi tiết về doanh nghiệp ảo thuộc lĩnh vực ${nameStr}.`,
      address: 'Tòa nhà văn phòng, Trung tâm tài chính',
      industry: { nameIndustry: nameStr.toUpperCase() },
      websiteURL: `https://${nameStr}-corp.vn`
    };
  }
  return null;
};