# API AUDIT REPORT - Frontend vs Backend Swagger

## 🔍 CRITICAL ISSUES FOUND

### ❌ **ISSUE 1: Missing Bearer Token**
**Problem:** GET requests to `/locations`, `/skills`, `/posts/public` **REQUIRE Bearer token** but frontend không check authentication trước khi gọi.

**Backend Security:** Keycloak yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
```

**Current Frontend:** api.js interceptor có thêm token NHƯNG các endpoint này được gọi cả khi **chưa login** (anonymous user).

---

### ❌ **ISSUE 2: Wrong Query Parameters Format**
**Frontend (api.js line 148-158):**
```javascript
// ❌ SAI: locationId vs industryId
getAllActiveJobs: (params = {}) => {
    if (params.locationId) queryParams.append('locationId', params.locationId);
    if (params.industryId) queryParams.append('industryId', params.industryId);
}
```

**Backend Swagger:**
```
GET /posts/public
- NO query parameters defined!
- Always returns ALL active jobs
```

**❌ BACKEND KHÔNG HỖ TRỢ FILTERING!**

---

### ❌ **ISSUE 3: Industries vs Skills Confusion**
**Frontend HomePage.jsx:**
- Dropdown "Chức vụ" gọi `/skills` và hiển thị skills
- NHƯNG backend structure là: **Industry > Skills**

**Backend Schema:**
```json
{
  "SkillResponse": {
    "skillId": int64,
    "skillName": string,
    "industryId": int64  // ⚠️ Skill thuộc Industry
  },
  "IndustryResponse": {
    "industryId": int64,
    "nameIndustry": string
  }
}
```

**👉 FIX: Dropdown "Chức vụ" nên gọi `/industries` thay vì `/skills`**

---

### ✅ **VERIFIED ENDPOINTS**

| Frontend API | Backend Endpoint | Status | Auth Required |
|-------------|-----------------|--------|---------------|
| `GET /skills` | ✅ `GET /skills` | Match | **YES** 🔒 |
| `GET /locations` | ✅ `GET /locations` | Match | **YES** 🔒 |
| `GET /industries` | ✅ `GET /industries` | Match | **YES** 🔒 |
| `GET /posts/public` | ✅ `GET /posts/public` | Match | **YES** 🔒 |
| `GET /posts/{id}` | ✅ `GET /posts/{id}` | Match | **YES** 🔒 |
| `POST /applications` | ✅ `POST /applications` | Match | **YES** 🔒 |
| `GET /applications/me` | ✅ `GET /applications/me` | Match | **YES** 🔒 |
| `GET /candidate_profile/my-profile` | ✅ `GET /candidate_profile/my-profile` | Match | **YES** 🔒 |
| `GET /company_profile/my-profile` | ✅ `GET /company_profile/my-profile` | Match | **YES** 🔒 |
| `POST /candidate_profile/login` | ✅ `POST /candidate_profile/login` | Match | NO |
| `POST /company_profile/login` | ✅ `POST /company_profile/login` | Match | NO |

---

## 🚨 **ROOT CAUSE ANALYSIS**

### Why data không hiển thị:

1. **Public endpoints yêu cầu authentication**
   - `/skills`, `/locations`, `/industries`, `/posts/public` đều cần Bearer token
   - Trang chủ (HomePage) gọi các API này TRƯỚC KHI user login
   - Result: **401 Unauthenticated** → fallback to mock data

2. **Backend chưa hỗ trợ public access cho master data**
   - Skills, Locations, Industries nên là public data
   - Hoặc backend cần tạo guest token

3. **Missing filtering on /posts/public**
   - Frontend gửi `locationId`, `industryId` params
   - Backend không nhận các params này
   - Filtering phải làm ở frontend (client-side)

---

## 🔧 **RECOMMENDED FIXES**

### Option 1: Backend tạo Public Endpoints (RECOMMENDED)
```java
// SecurityConfig.java
private static final String[] PUBLIC_GET_ENDPOINTS = {
    "/skills",
    "/skills/search",
    "/locations",
    "/locations/search", 
    "/industries",
    "/posts/public"
};

http.authorizeHttpRequests(requests -> requests
    .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
    // ...
);
```

### Option 2: Frontend login as guest trước (WORKAROUND)
```javascript
// Tạo guest account và login trước khi gọi API
const guestLogin = async () => {
    const response = await authAPI.loginCandidate({
        email: 'guest@jobmatch.com',
        password: 'Guest123!'
    });
    localStorage.setItem('accessToken', response.data.result.access_token);
};
```

### Option 3: Keep mock data (CURRENT APPROACH)
- ✅ Đã implement sẵn
- Works without backend changes
- Trade-off: Data không real-time

---

## 📊 **BACKEND SCHEMA MAPPING**

### JobPostingResponse Structure:
```json
{
  "jobPostingId": "string",
  "companyProfile": {
    "companyProfileId": "string",
    "email": "string",
    "companyName": "string",
    "phoneNumber": "string",
    "avatar": "string",  // ✅ HAS avatar!
    "address": "string",
    "desiredSalary": number,
    "tax": "string",
    "status": boolean
  },
  "title": "string",
  "description": "string",
  "salaryRequire": number,
  "locations": [
    {
      "id": int64,
      "city": "string"
    }
  ],
  "industry": {
    "industryId": int64,
    "nameIndustry": "string"
  },
  "skills": [
    {
      "skillId": int64,
      "skillName": "string",
      "industryId": int64
    }
  ],
  "deadline": "date",
  "status": "PENDING|ACTIVE|ACCEPTED|REJECTED|CLOSED|EXPIRED"
}
```

**Frontend Mapping Needed:**
- `job.companyProfile.companyName` → display name
- `job.companyProfile.avatar` → company logo (✅ Có sẵn!)
- `job.locations[0].city` → location string
- `job.industry.nameIndustry` → industry display
- `job.skills` → skill tags
- `job.salaryRequire` → salary display

---

## 🎯 **ACTION ITEMS**

### Critical (Must Fix):
1. ✅ Add Bearer token to ALL requests (done via interceptor)
2. ❌ **Fix HomePage dropdown**: Change from `/skills` to `/industries`
3. ❌ **Remove unsupported query params** from `/posts/public` call
4. ❌ **Test with real login** to verify token works

### Medium Priority:
5. Map backend response structure correctly in JobListPage
6. Map backend response structure correctly in JobDetailPage  
7. Handle empty arrays gracefully (locations, skills)

### Low Priority (Backend Improvement):
8. Ask backend team to make master data public
9. Ask backend team to add filtering params to `/posts/public`

---

## 📝 **NEXT STEPS**

1. Fix HomePage dropdown to use industries
2. Test API calls with logged-in user
3. Verify Bearer token is sent correctly
4. Update data mapping for job cards and detail page
5. Document which fields need mock vs real API

---

Generated: 2026-04-04
