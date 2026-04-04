# 📋 SWAGGER API ENDPOINTS - CHÍNH XÁC TỪ BACKEND

## ✅ ĐÃ XÁC NHẬN TỪ SWAGGER

### 🔑 Authentication APIs

**Candidate:**
- POST `/candidate_profile/register` - Đăng ký candidate
- POST `/candidate_profile/login` - Login candidate
- GET `/candidate_profile/my-profile` - Lấy profile của mình
- PUT `/candidate_profile/{profileId}` - Update profile

**Company:**
- POST `/company_profile/register` - Đăng ký company  
- POST `/company_profile/login` - Login company
- GET `/company_profile/my-profile` - Lấy profile của mình
- PUT `/company_profile/{profileId}` - Update profile

---

### 📋 Job Posting APIs

**Public (Guest có thể xem):**
- ✅ `GET /posts/public` - Lấy tất cả jobs ACTIVE
- ✅ `GET /posts/{id}` - Xem chi tiết 1 job

**Company (Cần auth):**
- POST `/posts` - Tạo job mới
- GET `/posts/my-jobs` - Lấy jobs của mình
- PUT `/posts/{id}` - Update job
- PUT `/posts/{id}/close` - Đóng job
- PUT `/posts/{id}/reopen` - Mở lại job

**Admin:**
- GET `/posts/admin/pending` - Lấy jobs chờ duyệt
- ✅ `PATCH /posts/admin/{id}/status?status=ACTIVE` - Duyệt job

---

### 📍 Locations API

- ✅ `GET /locations` - Lấy tất cả locations
- GET `/locations/search?keyword=...` - Tìm kiếm location
- GET `/locations/{id}` - Chi tiết location
- POST `/locations` - Tạo location mới (admin)

---

### 🏭 Industries API

- ✅ `GET /industries` - Lấy tất cả industries
- GET `/industries/{id}` - Chi tiết industry
- POST `/industries` - Tạo industry mới (admin)

---

### 🔧 Skills API

- ✅ `GET /skills` - Lấy tất cả skills
- GET `/skills/search?keyword=...` - Tìm kiếm skill
- GET `/skills/{id}` - Chi tiết skill

---

### 💼 Job Applications

**Candidate:**
- POST `/applications` - Ứng tuyển job (multipart/form-data)
  ```
  data: JobApplicationRequest (JSON)
  file: CV file (binary)
  ```
- GET `/applications/me` - Lấy danh sách ứng tuyển của mình
- PUT `/applications/{id}` - Update application
- DELETE `/applications/{id}` - Hủy ứng tuyển

**Company:**
- GET `/applications/job/{jobId}` - Xem ứng viên của job
- PATCH `/applications/{id}/accept` - Chấp nhận ứng viên
- PATCH `/applications/{id}/reject` - Từ chối ứng viên

---

### 📄 Profile CV

- POST `/profile-cv` - Upload CV
- GET `/profile-cv/my-profileCV` - Lấy danh sách CV của mình
- GET `/profile-cv/download/{cvId}` - Download CV
- PATCH `/profile-cv/{id}/is-default` - Set CV mặc định
- PATCH `/profile-cv/{id}/un-default` - Bỏ CV mặc định
- DELETE `/profile-cv/{id}` - Xóa CV

---

### 🔔 Notifications

- GET `/notifications` - Lấy thông báo
- GET `/notifications/unread-count` - Số thông báo chưa đọc
- PATCH `/notifications/{id}/read` - Đánh dấu đã đọc
- PATCH `/notifications/{id}/unread` - Đánh dấu chưa đọc
- DELETE `/notifications/{id}` - Xóa thông báo

---

### ☁️ Upload

- POST `/upload` - Upload file lên Cloudinary

---

## 🎯 FRONTEND ĐÃ GỌI ĐÚNG HAY CHƯA?

### ✅ ĐÚNG:
- `/posts/public` ✅
- `/posts/{id}` ✅
- `/locations` ✅
- `/industries` ✅
- `/skills` ✅
- `/candidate_profile/login` ✅
- `/candidate_profile/register` ✅
- `/candidate_profile/my-profile` ✅
- `/company_profile/my-profile` ✅

### ❌ CHƯA CÓ TRONG FRONTEND:
- `/applications` (apply job)
- `/applications/me` (my applications)
- `/profile-cv` (upload CV)
- `/notifications` (thông báo)

---

## 🔍 VẤN ĐỀ HIỆN TẠI

**Status:** API gọi đúng, nhưng Backend trả về 0 jobs vì:
- Database có 6 jobs nhưng TẤT CẢ đều `status = 'PENDING'`
- API `/posts/public` chỉ trả jobs có `status = 'ACTIVE'`

**Giải pháp:**
- Dùng `approve-jobs.html` để duyệt jobs
- Hoặc dùng Swagger UI gọi: `PATCH /posts/admin/{id}/status?status=ACTIVE`

---

## 📝 NOTES

1. **Authentication:** Tất cả API (trừ login/register) đều cần Bearer token
2. **Response Format:** `{code: 1000, message: null, result: {...}}`
3. **Success Code:** 1000
4. **Error Codes:** 
   - 1002: Email already exists
   - 1006: Unauthenticated
   - 9999: Uncategorized error

5. **File Upload:** Dùng `multipart/form-data`, không phải JSON
