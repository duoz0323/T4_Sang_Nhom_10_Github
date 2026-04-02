# 🚀 HƯỚNG DẪN DEPLOY BACKEND SAU KHI SỬA

## ✅ ĐÃ SỬA XONG

File `Backend_Nhom10/src/main/java/stu/edu/Backend_Nhom10/configuration/SecurityConfig.java` đã được cập nhật:

- ✅ Thêm `PUBLIC_GET_ENDPOINTS` array (dòng 26-35)
- ✅ Thêm `.requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()` (dòng 46)

## 📋 BƯỚC TIẾP THEO

### Option 1: Deploy trên Render.com (Nếu bạn dùng Render)

1. **Commit và push code:**
```bash
cd Backend_Nhom10
git add .
git commit -m "fix: Add public GET endpoints for skills, locations, jobs"
git push origin main
```

2. **Render sẽ tự động rebuild và deploy**
   - Đợi khoảng 5-10 phút
   - Check logs trên Render dashboard

3. **Test sau khi deploy:**
```bash
curl https://t4-sang-nhom-10-backend.onrender.com/skills
curl https://t4-sang-nhom-10-backend.onrender.com/locations
curl https://t4-sang-nhom-10-backend.onrender.com/posts/public
```

### Option 2: Build và deploy thủ công

1. **Build project:**
```bash
cd Backend_Nhom10
./mvnw clean package -DskipTests
```

2. **File JAR sẽ được tạo tại:**
```
target/Backend_Nhom10-0.0.1-SNAPSHOT.jar
```

3. **Deploy file JAR này lên server của bạn**

## 🧪 KIỂM TRA SAU KHI DEPLOY

### Test với curl:

```bash
# Test skills - Phải trả về list skills
curl https://t4-sang-nhom-10-backend.onrender.com/skills

# Kết quả mong đợi:
# {
#   "code": 1000,
#   "message": "Success",
#   "result": [
#     {"skillId": 1, "name": "Java"},
#     {"skillId": 2, "name": "React"},
#     ...
#   ]
# }
```

```bash
# Test locations - Phải trả về list locations
curl https://t4-sang-nhom-10-backend.onrender.com/locations

# Kết quả mong đợi:
# {
#   "code": 1000,
#   "message": "Success",
#   "result": [
#     {"id": 1, "city": "Hồ Chí Minh"},
#     {"id": 2, "city": "Hà Nội"},
#     ...
#   ]
# }
```

```bash
# Test jobs - Phải trả về list jobs
curl https://t4-sang-nhom-10-backend.onrender.com/posts/public

# Kết quả mong đợi:
# {
#   "code": 1000,
#   "message": "Success",
#   "result": [...]
# }
```

### ❌ LỖI CŨ (trước khi sửa):
```json
{
  "code": 1006,
  "message": "Unauthenticated"
}
```

### ✅ THÀNH CÔNG (sau khi sửa và deploy):
```json
{
  "code": 1000,
  "message": "Success",
  "result": [...]
}
```

## 🎯 SAU KHI BACKEND DEPLOY XONG

Frontend sẽ **TỰ ĐỘNG** lấy dữ liệu thật từ API:

1. ✅ Dropdown "Chức danh" → Hiện skills từ DB
2. ✅ Dropdown "Thành phố" → Hiện locations từ DB  
3. ✅ Danh sách công việc → Hiện jobs từ DB
4. ✅ Chi tiết công việc → Data từ DB

**Không cần sửa gì thêm ở Frontend!** Code đã sẵn sàng.

## 📝 LƯU Ý

- Sau khi deploy, đợi 1-2 phút để service khởi động
- Clear cache trình duyệt (Ctrl+Shift+R) để thấy dữ liệu mới
- Nếu vẫn thấy mock data, check console xem có lỗi API không

## ⚡ TÓM TẮT

1. ✅ Backend đã sửa xong
2. 🔄 Commit + Push code
3. ⏳ Đợi deploy (5-10 phút)
4. 🧪 Test API endpoints
5. 🎉 Frontend tự động lấy data thật!
