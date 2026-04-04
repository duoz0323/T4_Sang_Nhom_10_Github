# 📋 API MAPPING VERIFICATION REPORT
**Frontend API Calls vs Backend Endpoints**

---

## ✅ BACKEND ENDPOINTS (Available)

### 🔐 Auth & Profile
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/candidate_profile/register` | Register Candidate | ❌ No |
| POST | `/candidate_profile/login` | Login Candidate | ❌ No |
| POST | `/company_profile/register` | Register Company | ❌ No |
| POST | `/company_profile/login` | Login Company | ❌ No |
| GET | `/candidate_profile/my-profile` | Get my candidate profile | ✅ Yes |
| GET | `/candidate_profile/{profileId}` | Get candidate by ID | ✅ Yes |
| GET | `/candidate_profile/profiles` | Get all candidates | ✅ Yes |
| PUT | `/candidate_profile/{profileId}` | Update my candidate profile | ✅ Yes |
| DELETE | `/candidate_profile/{profileId}` | Delete candidate account | ✅ Yes |
| GET | `/company_profile/my-profile` | Get my company profile | ✅ Yes |
| GET | `/company_profile/{profileId}` | Get company by ID | ✅ Yes |
| GET | `/company_profile/profiles` | Get all companies | ✅ Yes |
| PUT | `/company_profile/{profileId}` | Update my company profile | ✅ Yes |
| DELETE | `/company_profile/{profileId}` | Delete company account | ✅ Yes |

### 💼 Job Postings
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/posts` | Create new job posting | ✅ Yes |
| GET | `/posts/public` | Get all active jobs (public list) | ✅ Yes |
| GET | `/posts/{id}` | Get job detail by ID | ✅ Yes |
| GET | `/posts/my-jobs` | Get my company's jobs | ✅ Yes |
| PUT | `/posts/{id}` | Update job posting | ✅ Yes |
| PUT | `/posts/{id}/close` | Close job posting | ✅ Yes |
| PUT | `/posts/{id}/reopen` | Reopen closed job | ✅ Yes |
| PATCH | `/posts/admin/{id}/status` | Admin approve/reject job | ✅ Yes |
| GET | `/posts/admin/pending` | Get pending jobs (admin) | ✅ Yes |

### 📄 Job Applications
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/applications` | Apply to job (multipart) | ✅ Yes |
| GET | `/applications/me` | Get my applications (candidate) | ✅ Yes |

### 📍 Location & Industry
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/locations` | Get all locations | ✅ Yes |
| GET | `/locations/{id}` | Get location by ID | ✅ Yes |
| GET | `/locations/search?keyword=` | Search locations | ✅ Yes |
| POST | `/locations` | Create location | ✅ Yes |
| PUT | `/locations/{id}` | Update location | ✅ Yes |
| DELETE | `/locations/{id}` | Delete location | ✅ Yes |
| GET | `/industries` | Get all industries | ✅ Yes |
| GET | `/industries/{id}` | Get industry by ID | ✅ Yes |
| POST | `/industries` | Create industry | ✅ Yes |
| PUT | `/industries/{id}` | Update industry | ✅ Yes |
| DELETE | `/industries/{id}` | Delete industry | ✅ Yes |

### 🏷️ Skills
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/skills` | Get all skills | ✅ Yes |
| GET | `/skills/{id}` | Get skill by ID | ✅ Yes |
| GET | `/skills/search?keyword=` | Search skills | ✅ Yes |
| POST | `/skills` | Create skill | ✅ Yes |
| PUT | `/skills/{id}` | Update skill | ✅ Yes |
| DELETE | `/skills/{id}` | Delete skill | ✅ Yes |

---

## ✅ FRONTEND API CALLS (Implemented)

### ✨ Current Implementation Status

**File**: `/src/services/api.js`

#### ✅ Auth API - All good
```javascript
authAPI.loginCandidate()     → POST /candidate_profile/login ✅
authAPI.registerCandidate()  → POST /candidate_profile/register ✅
authAPI.loginCompany()       → POST /company_profile/login ✅
authAPI.registerCompany()    → POST /company_profile/register ✅
```

#### ✅ Profile API - All good
```javascript
profileAPI.getMyCandidateProfile()       → GET /candidate_profile/my-profile ✅
profileAPI.getMyCompanyProfile()         → GET /company_profile/my-profile ✅
profileAPI.updateCandidateProfile()      → PUT /candidate_profile/{id} ✅
profileAPI.updateCompanyProfile()        → PUT /company_profile/{id} ✅
profileAPI.deleteCandidateAccount()      → DELETE /candidate_profile/{id} ✅
profileAPI.deleteCompanyAccount()        → DELETE /company_profile/{id} ✅
```

#### ✅ Job API - Mostly good but missing some
```javascript
jobAPI.getAllActiveJobs()    → GET /posts/public ✅ [CORRECT - for homepage]
jobAPI.getJobById()          → GET /posts/{id} ✅
jobAPI.getMyJobs()           → GET /posts/my-jobs ✅
jobAPI.createJob()           → POST /posts ✅
jobAPI.updateJob()           → PUT /posts/{id} ✅
jobAPI.closeJob()            → PUT /posts/{id}/close ✅
jobAPI.reopenJob()           → PUT /posts/{id}/reopen ✅
jobAPI.applyJob()            → POST /applications ✅ (multipart)
jobAPI.getMyApplications()   → GET /applications/me ✅
jobAPI.getPendingJobs()      → GET /posts/admin/pending ⚠️ [MISSING]
jobAPI.updateJobStatus()     → PATCH /posts/admin/{id}/status ⚠️ [MISSING]
```

#### ✅ Location API - All good
```javascript
locationAPI.getAll()   → GET /locations ✅
locationAPI.search()   → GET /locations/search ✅
```

#### ✅ Industry API - All good
```javascript
industryAPI.getAll()   → GET /industries ✅
```

#### ✅ Skill API - All good
```javascript
skillAPI.getAll()      → GET /skills ✅
skillAPI.search()      → GET /skills/search ✅
```

#### ✅ Notification API - Missing backend implementation
```javascript
notificationAPI.getNotifications()    → GET /notifications ⚠️ [NOT FOUND]
notificationAPI.getUnreadCount()      → GET /notifications/unread-count ⚠️ [NOT FOUND]
notificationAPI.markAsRead()          → PATCH /notifications/{id}/read ⚠️ [NOT FOUND]
notificationAPI.deleteNotification()  → DELETE /notifications/{id} ⚠️ [NOT FOUND]
```

---

## ⚠️ ISSUES FOUND

### 🔴 CRITICAL Issues

#### 1. **Missing Admin APIs in Frontend** (For Admin Dashboard)
**File**: `/src/services/api.js` - Lines 115-139

**Issue**: Admin job approval endpoints NOT in FE
```javascript
// Backend has these but FE doesn't call them properly
jobAPI.getPendingJobs()      // ❌ MISSING
jobAPI.updateJobStatus()     // ❌ MISSING
```

**Fix Needed**:
```javascript
// Add to jobAPI in /src/services/api.js
getPendingJobs: () => {
  return api.get('/posts/admin/pending');
},

updateJobStatus: (id, status) => {
  return api.patch(`/posts/admin/${id}/status`, {}, { params: { status } });
},
```

#### 2. **Notifications Not Implemented in Backend**
**Issue**: Frontend calls `/notifications` but Backend has NO NotificationController implementation details

**Status**: ⚠️ Frontend API exists but Backend endpoints may not be fully working
**Location**: `/src/services/api.js` lines 244-266

#### 3. **GET /posts/public - PARAMETER MISMATCH**
**Issue**: Frontend sends query params, need to verify Backend accepts them

**Frontend**:
```javascript
// /src/services/api.js:146-159
const queryParams = new URLSearchParams();
if (params.keyword) queryParams.append('keyword', params.keyword);
if (params.locationId) queryParams.append('locationId', params.locationId);
if (params.industryId) queryParams.append('industryId', params.industryId);
if (params.minSalary) queryParams.append('minSalary', params.minSalary);
if (params.maxSalary) queryParams.append('maxSalary', params.maxSalary);
if (params.workingFormat) queryParams.append('workingFormat', params.workingFormat);
if (params.page) queryParams.append('page', params.page);
if (params.size) queryParams.append('size', params.size);

return api.get(`/posts/public?${queryString}`);
```

**Backend** (`JobPostingController.java:60-65`):
```java
@GetMapping("/public")
public ApiResponse<List<JobPostingResponse>> getAllActive() {
    return ApiResponse.<List<JobPostingResponse>>builder()
            .result(jobPostingService.getAllActive())
            .build();
}
```

**Issue**: Backend doesn't accept any query parameters!
**Status**: 🔴 NEEDS FIX

---

## 🎯 PAGE-BY-PAGE API ALIGNMENT

### 📱 **HomePage.jsx** `/src/features/home/pages/HomePage.jsx`

**APIs Currently Used**:
```javascript
Line 141: jobAPI.getAllActiveJobs()    ✅ Gets public jobs for display
Line 102: locationAPI.getAll()         ✅ Gets locations for search dropdown
Line 103: industryAPI.getAll()         ✅ Gets industries for search dropdown
```

**Check**:
- ✅ `GET /posts/public` - Correct for showing featured jobs
- ✅ `GET /locations` - Correct for filters
- ✅ `GET /industries` - Correct for filters

**Issue**: HomePage doesn't use search params yet (line 126 is TODO)

---

### 💼 **JobListPage.jsx** (If exists)
```javascript
// Should call:
jobAPI.getAllActiveJobs(filters)  // With search params
```

---

### 📄 **JobDetailPage.jsx** (If exists)
```javascript
// Should call:
jobAPI.getJobById(jobId)          // ✅ Correct
jobAPI.applyJob()                 // ✅ Correct
```

---

### 👤 **ProfilePage.jsx** (If exists)
```javascript
// Candidate should call:
profileAPI.getMyCandidateProfile() // ✅ Correct

// Company should call:
profileAPI.getMyCompanyProfile()   // ✅ Correct
```

---

### 🏢 **CompanyProfilePage.jsx**
```javascript
// Should call:
profileAPI.getMyCompanyProfile()   // ✅ Correct
profileAPI.updateCompanyProfile()  // ✅ Correct
```

---

### 💼 **CompanyDashboard.jsx**
```javascript
// Should call:
jobAPI.getMyJobs()                 // ✅ Correct - Get company's jobs
jobAPI.createJob()                 // ✅ Correct - Create new job
jobAPI.updateJob()                 // ✅ Correct - Edit job
jobAPI.closeJob()                  // ✅ Correct - Close job
```

---

### 🔎 **UsersManagementPage.jsx** (Admin only)
```javascript
// Should call:
jobAPI.getPendingJobs()            // ⚠️ MISSING in FE - needs implementation
jobAPI.updateJobStatus()           // ⚠️ MISSING in FE - needs implementation
```

---

## 🔧 REQUIRED FIXES

### Priority 1: CRITICAL (Frontend Breaks If Not Fixed)

1. **Add Missing Admin APIs to `/src/services/api.js`**
   - Add `getPendingJobs()`
   - Add `updateJobStatus()`
   - Use in `UsersManagementPage.jsx`

2. **Make Backend `/posts/public` Accept Query Params**
   - Current: No params handling
   - Need: Accept `keyword`, `locationId`, `industryId`, `minSalary`, `maxSalary`, `workingFormat`, `page`, `size`
   - Impacts: HomePage search functionality

### Priority 2: IMPORTANT (Features Won't Work)

3. **Verify Notification Endpoints in Backend**
   - Check if `NotificationController` fully implements all endpoints
   - Location: Backend NotificationController

4. **Implement File Upload for Profile Avatar/CV**
   - Already in FE: `profileAPI.uploadCandidateAvatar()`, `uploadCV()`
   - Verify Backend implements these endpoints

### Priority 3: NICE TO HAVE

5. **Add Profile Change Password Endpoints**
   - Already in FE but check Backend implementation
   - `profileAPI.changeCandidatePassword()`
   - `profileAPI.changeCompanyPassword()`

---

## 📊 SUMMARY TABLE

| Component | API Endpoint | FE Implementation | BE Implementation | Status |
|-----------|---|---|---|---|
| HomePage | GET /posts/public | ✅ | ✅ | ⚠️ No params support |
| HomePage | GET /locations | ✅ | ✅ | ✅ |
| HomePage | GET /industries | ✅ | ✅ | ✅ |
| LoginPage | POST /candidate_profile/login | ✅ | ✅ | ✅ |
| RegisterPage | POST /candidate_profile/register | ✅ | ✅ | ✅ |
| JobListPage | GET /posts/public (with filters) | ❓ | ⚠️ | ⚠️ |
| JobDetailPage | GET /posts/{id} | ✅ | ✅ | ✅ |
| JobDetailPage | POST /applications | ✅ | ✅ | ✅ |
| ProfilePage | GET /candidate_profile/my-profile | ✅ | ✅ | ✅ |
| CompanyProfile | GET /company_profile/my-profile | ✅ | ✅ | ✅ |
| CompanyDashboard | GET /posts/my-jobs | ✅ | ✅ | ✅ |
| CompanyDashboard | POST /posts | ✅ | ✅ | ✅ |
| AdminDashboard | GET /posts/admin/pending | ❌ | ✅ | ⚠️ FE missing |
| AdminDashboard | PATCH /posts/admin/{id}/status | ❌ | ✅ | ⚠️ FE missing |
| Notifications | GET /notifications | ⚠️ | ❓ | ⚠️ |

---

## ✨ NEXT STEPS

1. **Verify Backend `/posts/public` Query Param Support** (HOT FIX)
2. **Add Admin APIs to Frontend** (For admin dashboard)
3. **Implement Search Functionality** in JobListPage
4. **Test All Endpoints with Bearer Token**
5. **Create API Integration Tests**

