// Hằng số - các hằng số toàn ứng dụng

// Các điểm cuối API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Các tuyến đường
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  JOBS: '/jobs',
  ADMIN: '/admin',
};

// Vai trò người dùng
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  CANDIDATE: 'CANDIDATE',
  COMPANY: 'COMPANY',
};

// Thời gian hết hạn token (giây)
export const TOKEN_EXPIRATION = 300; // 5 minutes


export const MOCK_LOCATIONS = [
  { id: 1, city: 'Hồ Chí Minh' },
  { id: 2, city: 'Hà Nội' },
  { id: 3, city: 'Đà Nẵng' },
  { id: 4, city: 'Cần Thơ' },
  { id: 5, city: 'Hải Phòng' },
  { id: 6, city: 'Đồng Nai' },
  { id: 7, city: 'Bình Dương' },
  { id: 8, city: 'Bà Rịa - Vũng Tàu' }
];

export const MOCK_INDUSTRIES = [
  { industryId: 1, nameIndustry: 'Công nghệ thông tin' },
  { industryId: 2, nameIndustry: 'Tài chính - Ngân hàng' },
  { industryId: 3, nameIndustry: 'Y tế - Dược phẩm' },
  { industryId: 4, nameIndustry: 'Marketing - Truyền thông' },
  { industryId: 5, nameIndustry: 'Vận tải - Logistics' },
  { industryId: 6, nameIndustry: 'Sản xuất - Bán lẻ' },
  { industryId: 7, nameIndustry: 'Giáo dục - Đào tạo' },
  { industryId: 8, nameIndustry: 'Xây dựng - Bất động sản' }
];

export const MOCK_SKILLS = [
  { skillId: 1, skillName: 'ReactJS', industryId: 1 },
  { skillId: 2, skillName: 'Spring Boot', industryId: 1 },
  { skillId: 3, skillName: 'NodeJS', industryId: 1 },
  { skillId: 4, skillName: 'Python', industryId: 1 },
  { skillId: 5, skillName: 'Marketing', industryId: 2 },
  { skillId: 6, skillName: 'Sales', industryId: 2 },
  { skillId: 7, skillName: 'Auditing', industryId: 3 },
  { skillId: 8, skillName: 'Tax', industryId: 3 },
  { skillId: 9, skillName: 'Figma', industryId: 4 },
  { skillId: 10, skillName: 'English', industryId: 7 },
  { skillId: 11, skillName: 'Teaching', industryId: 7 },
  { skillId: 12, skillName: 'Logistics Management', industryId: 5 }
];
