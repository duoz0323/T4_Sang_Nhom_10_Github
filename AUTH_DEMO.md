# Authentication Demo Script

## Test User Login

Bạn có thể test authentication bằng cách:

### 1. Đăng nhập với mock user (Demo)
Thêm code này vào console của trình duyệt:

\\\javascript
// Mock user login
const mockUser = {
  id: '1',
  name: 'Nguyễn Minh Anh',
  email: 'minhanh@example.com',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAd1YaHyKBU7JhUYDULnJcHsl416rSzk4EIijIZwhuSqPjDKgD2VbO-Uc9IqemZgP-BJOwP-Z571iDpWiksmVniXvztfB4TjKSm7ZJscKIv4C-aB8-RqXzhiAZjSx_pbQn3sH5KAurqNJ8CcqjRE-h57Cava8byM2LtYeOehinppA0hZyPRnt0aBijG7FugKfvzrgChn17WY96vjXJakF-qyR48zRysijpgXjZwHO88QAH7jFkQfDYiS03xWZsPygTVY5Vz7oVkLdp5',
  role: 'APPLICANT' // hoặc 'COMPANY' hoặc 'ADMIN'
};

localStorage.setItem('user', JSON.stringify(mockUser));
localStorage.setItem('token', 'mock-token-123');
window.location.reload();
\\\

### 2. Test các role khác
- APPLICANT: Ứng viên (có ProfileSidebar)
- COMPANY: Doanh nghiệp (sẽ có CompanySidebar)
- ADMIN: Quản trị viên (sẽ có AdminSidebar)

### 3. Đăng xuất
Click vào avatar → chọn "Đăng xuất"

## Features đã implement:

✅ Authentication Context với 3 roles
✅ Header với avatar dropdown
✅ Active state navigation (gạch chân trang hiện tại)
✅ JobList spacing fix
✅ Save job toggle (bookmark đổi màu khi click)
✅ Logout functionality
✅ Profile/Settings access từ dropdown
