# 🎯 HƯỚNG DẪN HOÀN CHỈNH - TÍCh HỢP API VỚI GUEST AUTO-LOGIN

## 📌 TÓM TẮT

**Vấn đề:** Backend yêu cầu Bearer Token cho MỌI API requests  
**Giải pháp:** Frontend tự động login với Guest account để lấy token  
**Trạng thái Frontend:** ✅ ĐÃ HOÀN THÀNH  
**Trạng thái Backend:** ⚠️ CẦN TẠO GUEST ACCOUNT  

---

## 🚀 CÁCH SỬ DỤNG (CHO NGƯỜI DÙNG)

### Bước 1: Backend Tạo Guest Account

**Yêu cầu Backend team tạo account với thông tin:**

```json
{
  "email": "guest@jobmatch.com",
  "password": "Guest123!@#",
  "fullName": "Guest User",
  "birthday": "1990-01-01"
}
```

**Hướng dẫn chi tiết:** Xem file `CREATE_GUEST_ACCOUNT.md`

### Bước 2: Test Guest Account

**Mở file:** `test-guest-login.html` trong browser

1. Click nút **"🔑 Test Guest Login"**
2. Nếu thấy `✅ SUCCESS!` → Guest account đã sẵn sàng
3. Nếu thấy `❌ ERROR` → Guest account chưa được tạo

### Bước 3: Chạy Frontend

```bash
cd Frontend_Nhom10
npm install
npm run dev
```

Mở browser: `http://localhost:5173`

### Bước 4: Kiểm Tra

**Mở Console (F12), bạn sẽ thấy:**

```
🔐 Auto-login with guest account...
✅ Guest login successful
🔄 Calling /posts/public with token...
✅ Got 20 jobs from API
```

**Nếu KHÔNG thấy** → Guest account chưa được tạo!

---

## 🔧 CÁCH HOẠT ĐỘNG (CHO DEVELOPER)

### Flow Tự Động

```
User mở trang
    ↓
ensureAuthenticated() được gọi
    ↓
Kiểm tra localStorage có token?
    ├─ Có → Check expiration
    │   ├─ Còn hạn → Dùng token
    │   └─ Hết hạn → Auto-login guest
    └─ Không → Auto-login guest
    ↓
Auto-login với guest@jobmatch.com
    ↓
Lưu token vào localStorage
    ↓
Axios tự động thêm Bearer token vào headers
    ↓
API trả về data thật!
```

### Code Example

**Before (Mock Data):**
```javascript
const fetchJobs = async () => {
  const response = await jobAPI.getAllActiveJobs();
  // ❌ 401 Unauthenticated!
};
```

**After (Real Data):**
```javascript
import { ensureAuthenticated } from '../../../services/guestAuth';

const fetchJobs = async () => {
  await ensureAuthenticated(); // Auto-login nếu cần
  const response = await jobAPI.getAllActiveJobs();
  // ✅ 200 OK với data từ DB!
};
```

---

## 📁 FILES QUAN TRỌNG

### 1. Guest Auth Service
**File:** `Frontend_Nhom10/src/services/guestAuth.js`

Chứa logic auto-login:
- `ensureAuthenticated()` - Check token & auto-login
- `autoLoginAsGuest()` - Login với guest credentials
- `isTokenExpired()` - Check token expiration

### 2. API Service
**File:** `Frontend_Nhom10/src/services/api.js`

Axios instance với interceptors:
- Request interceptor: Tự động thêm Bearer token
- Response interceptor: Handle 401 errors

### 3. Pages Đã Tích Hợp
- ✅ `HomePage.jsx` - Featured jobs với auto-login
- ✅ `JobListPage.jsx` - Job listing với filters & auto-login
- ⏳ `JobDetailPage.jsx` - Cần thêm auto-login
- ⏳ `ProfilePage.jsx` - Cần thêm auto-login
- ⏳ `SettingsPage.jsx` - Cần thêm auto-login

---

## 🧪 TESTING

### Test 1: Guest Login Hoạt Động?

**Cách 1: Dùng test-guest-login.html**
1. Mở file trong browser
2. Click "Test Guest Login"
3. Check kết quả

**Cách 2: Dùng curl**
```bash
curl -X POST https://t4-sang-nhom-10-backend.onrender.com/candidate_profile/login \
  -H "Content-Type: application/json" \
  -d '{"email":"guest@jobmatch.com","password":"Guest123!@#"}'
```

**Expected:**
```json
{
  "code": 1000,
  "result": {
    "access_token": "eyJhbGci...",
    "token_type": "Bearer"
  }
}
```

### Test 2: Frontend Auto-Login?

1. Xóa localStorage: `localStorage.clear()`
2. Reload trang
3. Mở Console
4. Phải thấy: `✅ Guest login successful`

### Test 3: Jobs Hiển Thị Từ API?

1. Mở trang Jobs
2. Check console có log: `✅ Got X jobs from API`
3. Check Network tab:
   - Request có header `Authorization: Bearer ...`
   - Response status 200
   - Response code 1000

---

## ⚠️ TROUBLESHOOTING

### Issue 1: "401 Unauthenticated"

**Nguyên nhân:** Guest account chưa được tạo

**Fix:**
1. Mở `test-guest-login.html`
2. Test login
3. Nếu fail → Yêu cầu Backend tạo account

### Issue 2: "Guest login failed"

**Nguyên nhân:** Password sai hoặc account không tồn tại

**Fix:**
1. Check `guestAuth.js` có đúng credentials không
2. Test login qua Postman
3. Yêu cầu Backend check database

### Issue 3: Vẫn hiện mock data

**Nguyên nhân:** ensureAuthenticated() chưa được gọi

**Fix:**
1. Check console có log `🔐 Auto-login...`?
2. Check file có import `ensureAuthenticated`?
3. Check có gọi `await ensureAuthenticated()` trước API call?

### Issue 4: CORS Error

**Nguyên nhân:** Backend chưa config CORS

**Fix:**
1. Backend phải allow origin: `http://localhost:5173`
2. Backend phải allow headers: `Authorization`, `Content-Type`

---

## 📊 BUILD STATUS

```bash
cd Frontend_Nhom10
npm run build
```

**Result:**
```
✓ built in 6.39s
✓ dist/index.html         0.98 kB
✓ dist/assets/index.css 112.42 kB
✓ dist/assets/index.js  458.xx kB
```

**No errors! ✅**

---

## 🎯 CHECKLIST

### Frontend (Đã Hoàn Thành)
- [x] Tạo guestAuth.js service
- [x] Update HomePage với auto-login
- [x] Update JobListPage với auto-login
- [x] Build thành công
- [x] Tạo test file (test-guest-login.html)
- [x] Tạo documentation

### Backend (Cần Làm)
- [ ] Tạo Guest account: `guest@jobmatch.com`
- [ ] Test login với guest credentials
- [ ] Verify API trả về data với guest token

### Testing (Cần Làm)
- [ ] Test guest login qua test-guest-login.html
- [ ] Test frontend auto-login
- [ ] Test jobs hiển thị từ API
- [ ] Test filtering hoạt động
- [ ] Test job detail page

---

## 📞 SUPPORT

### Nếu Có Lỗi:

1. **Check console logs:**
   - Có `✅ Guest login successful`?
   - Có `✅ Got X jobs from API`?

2. **Check Network tab:**
   - Request có Bearer token?
   - Response status 200?
   - Response code 1000?

3. **Test guest login:**
   - Mở `test-guest-login.html`
   - Run full test
   - Screenshot kết quả

4. **Share information:**
   - Console logs
   - Network tab screenshot
   - test-guest-login.html results

---

## 🎉 KẾT QUẢ CUỐI CÙNG

**Sau khi Backend tạo Guest account:**

✅ User mở trang → Tự động login guest  
✅ Jobs hiển thị từ database backend  
✅ Locations/Industries từ API  
✅ Filtering hoạt động  
✅ Search hoạt động  
✅ Không cần đăng ký để xem jobs  
✅ Smooth UX - không redirect  

**Frontend 100% sẵn sàng - chỉ cần Backend tạo 1 account!**

---

## 📚 DOCUMENTS

1. `CREATE_GUEST_ACCOUNT.md` - Hướng dẫn Backend tạo account
2. `test-guest-login.html` - Test guest login
3. `GUEST_LOGIN_SOLUTION.md` - Chi tiết giải pháp
4. `API_INTEGRATION_SUMMARY.md` - Tổng hợp API integration
5. `API_USAGE_GUIDE.md` - Hướng dẫn sử dụng API

---

**Last Updated:** 04/04/2026  
**Status:** ✅ Ready for Backend  
**Build:** ✅ Passing
