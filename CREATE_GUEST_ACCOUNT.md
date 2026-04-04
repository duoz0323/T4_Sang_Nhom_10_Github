# 🔐 HƯỚNG DẪN TẠO GUEST ACCOUNT - BACKEND

## Mục Đích
Tạo một tài khoản Guest để Frontend có thể tự động login và lấy dữ liệu mà không yêu cầu user đăng ký.

## Thông Tin Guest Account

```
Email: guest@jobmatch.com
Password: Guest123!@#
Full Name: Guest User
Birthday: 1990-01-01
```

## Cách Tạo

### Option 1: Qua Postman/API

**Endpoint:** POST `/candidate_profile/register`

**Request Body:**
```json
{
  "email": "guest@jobmatch.com",
  "password": "Guest123!@#",
  "fullName": "Guest User",
  "birthday": "1990-01-01"
}
```

**Expected Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "candidateProfileId": "...",
    "email": "guest@jobmatch.com",
    "fullName": "Guest User",
    "phoneNumber": null,
    "avatar": null,
    "address": null,
    "description": null,
    "birthday": "1990-01-01",
    "status": true
  }
}
```

### Option 2: Trực Tiếp Database

Nếu có quyền truy cập database:

```sql
-- Insert vào bảng candidate_profile
INSERT INTO candidate_profile (
  candidate_profile_id, 
  email, 
  password,  -- Hash với BCrypt
  full_name,
  birthday,
  status,
  created_at
) VALUES (
  UUID(),
  'guest@jobmatch.com',
  '$2a$10$...', -- BCrypt hash of "Guest123!@#"
  'Guest User',
  '1990-01-01',
  1,
  NOW()
);
```

## Test Sau Khi Tạo

**Login Test:**

```bash
curl -X POST https://t4-sang-nhom-10-backend.onrender.com/candidate_profile/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@jobmatch.com",
    "password": "Guest123!@#"
  }'
```

**Expected Response:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cC...",
    "expires_in": "300",
    "refresh_expires_in": "1800",
    "token_type": "Bearer",
    "id_token": "...",
    "scope": "profile email"
  }
}
```

## Lưu Ý

1. ✅ Account này **KHÔNG CẦN** permissions đặc biệt
2. ✅ Chỉ cần role **CANDIDATE** bình thường
3. ✅ Frontend sẽ auto-login với account này khi chưa có token
4. ⚠️ KHÔNG cho phép user thật dùng email này để register

## Security Considerations

- Guest account có thể xem jobs nhưng **KHÔNG NÊN** có quyền:
  - Apply jobs
  - Save jobs
  - Upload CV
  - Modify profile

- Frontend sẽ check role `isGuest: true` để disable các features này

## Verify

Sau khi tạo xong, test:

1. Login qua Postman → Lấy token
2. Gọi `/posts/public` với Bearer token
3. Phải trả về danh sách jobs

---

**Hoàn thành việc này trước khi Frontend có thể hiển thị dữ liệu!**
