# 📋 BÁO CÁO KIỂM TRA API MAPPING FRONTEND - BACKEND
## Tuyển Dụng JobMatch - Nhóm 10

**Ngày:** 04/04/2026 10:22  
**Status:** 🔴 NOT PRODUCTION READY

---

## 📊 TÓM TẮT TỔNG QUAN

| Metric | Value |
|--------|-------|
| Frontend API Methods | 26 |
| Backend Controllers | 9 |
| Backend Endpoints | 40+ |
| Endpoints Matched | 25 (83%) |
| Critical Issues | 4 🔴 |
| High Priority Issues | 2 🟡 |
| Estimated Fix Time | 13 hours |
| Blocking Production | YES 🔴 |

---

## ✅ ENDPOINTS ĐÃ KHỚP (25 endpoints)

### 🔐 Authentication (4/4)
- ✅ POST /candidate_profile/login
- ✅ POST /candidate_profile/register
- ✅ POST /company_profile/login
- ✅ POST /company_profile/register

### 👥 Profile (6/6)
- ✅ GET /candidate_profile/my-profile
- ✅ GET /company_profile/my-profile
- ✅ PUT /candidate_profile/{id}
- ✅ PUT /company_profile/{id}
- ✅ DELETE /candidate_profile/{id}
- ✅ DELETE /company_profile/{id}

### 📋 Job Posting (6/8)
- ✅ GET /posts/{id}
- ✅ GET /posts/my-jobs
- ✅ POST /posts
- ✅ PUT /posts/{id}
- ✅ PUT /posts/{id}/close
- ✅ PUT /posts/{id}/reopen
- ❌ GET /posts/public (has no filters)
- ✅ GET /posts/admin/pending (not in frontend but exists)

### 📍 Locations (2/2)
- ✅ GET /locations
- ✅ GET /locations/search

### 🏭 Industries (1/1)
- ✅ GET /industries

### 🔧 Skills (2/2)
- ✅ GET /skills
- ✅ GET /skills/search

### 🔔 Notifications (4/5)
- ✅ GET /notifications
- ✅ GET /notifications/unread-count
- ✅ PATCH /notifications/{id}/read
- ✅ DELETE /notifications/{id}
- ⚠️ PATCH /notifications/{id}/unread (not in frontend)

---

## 🔴 CRITICAL ISSUES (4 ISSUES - BLOCKING)

### 🔴 ISSUE #1: POST /applications - FORMAT SAI

**Severity:** CRITICAL  
**File Location:** Frontend: pi.js line 192-196 | Backend: JobApplicationController.java

#### Frontend Code (Current)
\\\javascript
applyJob: (postId, applicationData) => {
  return api.post(\/applications\, {
    postId,
    ...applicationData
  });
}
\\\

#### Backend Code (Expects)
\\\java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ApiResponse<JobApplicationResponse> apply(
  @RequestPart("data") JobApplicationRequest request,
  @RequestPart("file") MultipartFile file
) {
  return ApiResponse.<JobApplicationResponse>builder()
    .result(jobApplicationService.apply(request, file))
    .build();
}
\\\

#### The Problem
- **Frontend sends:** JSON format { postId, name, email, phone }
- **Backend expects:** MULTIPART/FORM-DATA with 2 parts:
  - "data": JobApplicationRequest (JSON)
  - "file": CV file (binary)
- **Result:** 415 Unsupported Media Type → **ALWAYS FAILS** ❌

#### Impact
- Users **CANNOT apply for jobs**
- Critical feature broken

#### Fix Option 1: Change Backend to Accept JSON
\\\java
@PostMapping
public ApiResponse<JobApplicationResponse> apply(
  @RequestBody JobApplicationRequest request
) {
  return ApiResponse.<JobApplicationResponse>builder()
    .result(jobApplicationService.apply(request))
    .build();
}
\\\

#### Fix Option 2: Change Frontend to Send MULTIPART
\\\javascript
applyJob: (postId, applicationData, cvFile) => {
  const formData = new FormData();
  formData.append('data', JSON.stringify({
    jobPostingId: postId,
    name: applicationData.name,
    email: applicationData.email,
    phone: applicationData.phone
  }));
  formData.append('file', cvFile);
  
  return api.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
\\\

**Recommended:** Option 1 (simpler, matches current frontend)

---

### 🔴 ISSUE #2: GET /posts/public - THIẾU FILTERS

**Severity:** CRITICAL  
**File Location:** Frontend: pi.js line 146-158 | Backend: JobPostingService.java line 116-121

#### Frontend Code (Sends Filters)
\\\javascript
getAllActiveJobs: (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.keyword) queryParams.append('keyword', params.keyword);
  if (params.locationId) queryParams.append('locationId', params.locationId);
  if (params.industryId) queryParams.append('industryId', params.industryId);
  if (params.minSalary) queryParams.append('minSalary', params.minSalary);
  if (params.maxSalary) queryParams.append('maxSalary', params.maxSalary);
  if (params.workingFormat) queryParams.append('workingFormat', params.workingFormat);
  if (params.page !== undefined) queryParams.append('page', params.page);
  if (params.size !== undefined) queryParams.append('size', params.size);
  
  return api.get(\/posts/public?\\);
}
\\\

#### Backend Code (Ignores Filters)
\\\java
@GetMapping("/public")
public ApiResponse<List<JobPostingResponse>> getAllActive() {
  return jobPostingRepository.findByStatusAndDeadlineAfter(Status.ACTIVE, LocalDate.now());
}
\\\

#### The Problem
- **Frontend:** Sends 8 filter parameters
- **Backend:** Accepts NO parameters
- **Result:** Filters are IGNORED, returns ALL active jobs without filtering ❌

#### Missing Filters
1. **keyword** - Search by job title/description
2. **locationId** - Filter by location
3. **industryId** - Filter by industry
4. **minSalary** / **maxSalary** - Filter by salary range
5. **workingFormat** - Filter by remote/on-site
6. **page** / **size** - Pagination

#### Impact
- Users **CANNOT search jobs**
- Users **CANNOT filter by location/salary/industry**
- Users **CANNOT paginate results**
- Job list feature essentially broken

#### Fix: Add Parameters to Backend
\\\java
@GetMapping("/public")
public ApiResponse<List<JobPostingResponse>> getAllActive(
  @RequestParam(required = false) String keyword,
  @RequestParam(required = false) Long locationId,
  @RequestParam(required = false) Long industryId,
  @RequestParam(required = false) BigDecimal minSalary,
  @RequestParam(required = false) BigDecimal maxSalary,
  @RequestParam(required = false) String workingFormat,
  @RequestParam(defaultValue = "0") int page,
  @RequestParam(defaultValue = "20") int size
) {
  return ApiResponse.<List<JobPostingResponse>>builder()
    .result(jobPostingService.getAllActive(
      keyword, locationId, industryId, minSalary, maxSalary, workingFormat, page, size))
    .build();
}
\\\

Backend Service:
\\\java
public List<JobPostingResponse> getAllActive(
  String keyword, Long locationId, Long industryId,
  BigDecimal minSalary, BigDecimal maxSalary, 
  String workingFormat, int page, int size
) {
  // Use JPA Specification or QueryDSL for filtering
  // Filter by:
  // - status = ACTIVE
  // - deadline > NOW
  // - IF keyword: title LIKE keyword OR description LIKE keyword
  // - IF locationId: location.id = locationId
  // - IF industryId: industry.id = industryId
  // - IF minSalary: salary >= minSalary
  // - IF maxSalary: salary <= maxSalary
  // - Apply pagination (page, size)
}
\\\

---

### 🔴 ISSUE #3: GET /applications/my-applications - ENDPOINT NOT EXISTS

**Severity:** CRITICAL  
**File Location:** Frontend: pi.js line 200-201

#### Frontend Code (Tries to Call)
\\\javascript
getMyApplications: () => {
  return api.get('/applications/my-applications');
}
\\\

#### Backend
- **Controller:** JobApplicationController.java
- **Status:** ENDPOINT DOES NOT EXIST ❌

#### The Problem
- Frontend calls endpoint that doesn't exist
- **Result:** 404 Not Found

#### Missing Endpoints
1. **GET /applications/my-applications** - Get candidate's applications
2. **GET /applications/job/{jobId}** - Get applicants for a job (HR)
3. **PATCH /applications/{id}/accept** - Accept applicant
4. **PATCH /applications/{id}/reject** - Reject applicant

#### Impact
- Candidates **CANNOT view their applications**
- HR **CANNOT manage applications**
- Recruitment workflow broken

#### Fix: Add Endpoints to JobApplicationController
\\\java
// Get my applications (candidate)
@GetMapping("/my-applications")
public ApiResponse<List<JobApplicationResponse>> getMyApplications() {
  return ApiResponse.<List<JobApplicationResponse>>builder()
    .result(jobApplicationService.getMyApplications())
    .build();
}

// Get applicants for a job (HR)
@GetMapping("/job/{jobId}")
public ApiResponse<List<JobApplicationForHRResponse>> getApplicationsByJob(
  @PathVariable String jobId
) {
  return ApiResponse.<List<JobApplicationForHRResponse>>builder()
    .result(jobApplicationService.getApplicationsByJob(jobId))
    .build();
}

// Accept applicant (HR)
@PatchMapping("/{id}/accept")
public ApiResponse<JobApplicationResponse> acceptApplication(
  @PathVariable String id
) {
  return ApiResponse.<JobApplicationResponse>builder()
    .result(jobApplicationService.accept(id))
    .build();
}

// Reject applicant (HR)
@PatchMapping("/{id}/reject")
public ApiResponse<JobApplicationResponse> rejectApplication(
  @PathVariable String id
) {
  return ApiResponse.<JobApplicationResponse>builder()
    .result(jobApplicationService.reject(id))
    .build();
}
\\\

---

### 🔴 ISSUE #4: Saved Jobs Feature - COMPLETELY MISSING

**Severity:** CRITICAL  
**File Location:** Frontend: pi.js line 205-222

#### Frontend Code (Calls Missing Endpoints)
\\\javascript
// Save job (candidate only)
saveJob: (postId) => {
  return api.post(\/saved-jobs\, { postId });
}

// Unsave job (candidate only)
unsaveJob: (postId) => {
  return api.delete(\/saved-jobs/\\);
}

// Get saved jobs (candidate only)
getSavedJobs: () => {
  return api.get('/saved-jobs');
}

// Check if job is saved
checkIfSaved: (postId) => {
  return api.get(\/saved-jobs/check/\\);
}
\\\

#### Backend
- **Controller:** DOES NOT EXIST ❌
- **Service:** DOES NOT EXIST ❌
- **Entity:** DOES NOT EXIST ❌

#### The Problem
- **Entire feature is missing**
- No backend implementation whatsoever
- Frontend cannot function

#### Missing Components
1. SavedJob JPA Entity
2. SavedJobRepository
3. SavedJobService
4. SavedJobController

#### Impact
- Candidates **CANNOT save jobs**
- Critical feature completely broken

#### Fix: Implement Entire Feature

**1. Create SavedJob Entity**
\\\java
@Entity
@Table(name = "saved_jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedJob {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;
  
  @ManyToOne
  @JoinColumn(name = "candidate_profile_id", nullable = false)
  private CandidateProfile candidateProfile;
  
  @ManyToOne
  @JoinColumn(name = "job_posting_id", nullable = false)
  private JobPosting jobPosting;
  
  @CreationTimestamp
  @Column(nullable = false)
  private LocalDateTime savedAt;
}
\\\

**2. Create SavedJobRepository**
\\\java
@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, String> {
  List<SavedJob> findByCandidateProfile(CandidateProfile candidate, Sort sort);
  
  Optional<SavedJob> findByCandidateProfileAndJobPosting(
    CandidateProfile candidate, JobPosting job);
  
  boolean existsByCandidateProfileAndJobPosting(
    CandidateProfile candidate, JobPosting job);
  
  void deleteByCandidateProfileAndJobPosting(
    CandidateProfile candidate, JobPosting job);
}
\\\

**3. Create SavedJobService**
\\\java
@Service
@RequiredArgsConstructor
public class SavedJobService {
  private final SavedJobRepository savedJobRepository;
  private final JobPostingRepository jobPostingRepository;
  private final CandidateProfileRepository candidateRepository;
  private final JobPostingMapper jobPostingMapper;
  private final SecurityUtils securityUtils;
  
  public void saveJob(String postId) {
    String userId = securityUtils.getObject();
    CandidateProfile candidate = candidateRepository.findByUserId(userId)
      .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    
    JobPosting job = jobPostingRepository.findById(postId)
      .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
    
    if (!savedJobRepository.existsByCandidateProfileAndJobPosting(candidate, job)) {
      SavedJob savedJob = SavedJob.builder()
        .candidateProfile(candidate)
        .jobPosting(job)
        .build();
      savedJobRepository.save(savedJob);
    }
  }
  
  public void unsaveJob(String postId) {
    String userId = securityUtils.getObject();
    CandidateProfile candidate = candidateRepository.findByUserId(userId)
      .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    
    JobPosting job = jobPostingRepository.findById(postId)
      .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
    
    savedJobRepository.deleteByCandidateProfileAndJobPosting(candidate, job);
  }
  
  public List<JobPostingResponse> getSavedJobs() {
    String userId = securityUtils.getObject();
    CandidateProfile candidate = candidateRepository.findByUserId(userId)
      .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    
    return savedJobRepository.findByCandidateProfile(
      candidate, 
      Sort.by(Sort.Direction.DESC, "savedAt")
    ).stream()
      .map(saved -> jobPostingMapper.toJobPostingResponse(saved.getJobPosting()))
      .toList();
  }
  
  public boolean isSaved(String postId) {
    String userId = securityUtils.getObject();
    CandidateProfile candidate = candidateRepository.findByUserId(userId)
      .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    
    JobPosting job = jobPostingRepository.findById(postId)
      .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
    
    return savedJobRepository.existsByCandidateProfileAndJobPosting(candidate, job);
  }
}
\\\

**4. Create SavedJobController**
\\\java
@RestController
@RequestMapping("/saved-jobs")
@RequiredArgsConstructor
@Slf4j
public class SavedJobController {
  private final SavedJobService savedJobService;
  
  @PostMapping
  public ApiResponse<Void> saveJob(@RequestBody SaveJobRequest request) {
    savedJobService.saveJob(request.getPostId());
    return ApiResponse.<Void>builder().build();
  }
  
  @DeleteMapping("/{postId}")
  public ApiResponse<Void> unsaveJob(@PathVariable String postId) {
    savedJobService.unsaveJob(postId);
    return ApiResponse.<Void>builder().build();
  }
  
  @GetMapping
  public ApiResponse<List<JobPostingResponse>> getSavedJobs() {
    return ApiResponse.<List<JobPostingResponse>>builder()
      .result(savedJobService.getSavedJobs())
      .build();
  }
  
  @GetMapping("/check/{postId}")
  public ApiResponse<Boolean> checkIfSaved(@PathVariable String postId) {
    return ApiResponse.<Boolean>builder()
      .result(savedJobService.isSaved(postId))
      .build();
  }
}
\\\

**5. Create SaveJobRequest DTO**
\\\java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SaveJobRequest {
  String postId;
}
\\\

---

## 🟡 HIGH PRIORITY ISSUES (2 ISSUES)

### 🟡 ISSUE #5: Missing Password Change Endpoints

**Severity:** MEDIUM  
**Impact:** Users cannot change password

Frontend expects (api.js):
- changeCandidatePassword(profileId, data)
- changeCompanyPassword(profileId, data)

Backend: **NOT IMPLEMENTED**

### 🟡 ISSUE #6: Missing Avatar/CV Upload Endpoints

**Severity:** MEDIUM  
**Impact:** Users cannot upload profile pictures or CVs

Frontend expects (api.js):
- uploadCandidateAvatar(profileId, file)
- uploadCompanyAvatar(profileId, file)
- uploadCV(profileId, file)

Backend: **NOT IMPLEMENTED**

---

## 📊 PHẦN AFFECTED FEATURES & PAGES

| Feature | Status | Impact |
|---------|--------|--------|
| View Job List | 🔴 | Filters not working |
| Search Jobs | 🔴 | No search parameters |
| Filter by Location | 🔴 | No backend support |
| Filter by Salary | 🔴 | No backend support |
| Apply for Job | 🔴 | Format mismatch |
| View My Applications | 🔴 | Endpoint missing |
| Save Job | 🔴 | Feature missing |
| View Saved Jobs | 🔴 | Feature missing |
| Accept/Reject Applicants | 🔴 | Endpoints missing |

| Page | Issues |
|------|--------|
| HomePage | Filters broken, job listing incomplete |
| JobListPage | All filters broken, search broken |
| JobDetailPage | Apply button broken |
| ApplicationsPage | Cannot view applications |
| SavedJobsPage | Feature completely broken |
| ProfilePage | Avatar upload missing, no password change |

---

## ⏰ TIMELINE & EFFORT ESTIMATES

### Phase 1: CRITICAL (MUST FIX FIRST) - 4-5 HOURS
- [ ] Fix POST /applications format → 30 mins
- [ ] Add filters to /posts/public → 2-3 hours
- [ ] Add /applications/my-applications → 1-1.5 hours

### Phase 2: HIGH (BEFORE LAUNCH) - 5-6 HOURS
- [ ] Add /applications/job/{jobId} → 1 hour
- [ ] Add PATCH /applications/{id}/accept & reject → 1 hour
- [ ] Implement Saved Jobs feature → 3-4 hours

### Phase 3: MEDIUM (NICE TO HAVE) - 2-3 HOURS
- [ ] Implement password change endpoints
- [ ] Implement avatar/CV upload endpoints

### Phase 4: QA & TESTING - 2-3 HOURS
- [ ] Backend API testing
- [ ] Frontend integration testing

**TOTAL ESTIMATED TIME: 13-17 hours**

---

## ✅ VERIFICATION CHECKLIST

Before deploying backend changes:

### Backend Testing
- [ ] POST /applications accepts JSON and returns 200 OK
- [ ] GET /posts/public?keyword=java returns filtered results
- [ ] GET /posts/public?locationId=1 returns filtered results
- [ ] GET /posts/public?minSalary=15000000 returns filtered results
- [ ] GET /applications/my-applications returns user's applications
- [ ] POST /saved-jobs returns 200 OK
- [ ] GET /saved-jobs returns saved jobs list
- [ ] GET /saved-jobs/check/{postId} returns boolean

### Database Verification
- [ ] SavedJob table created with correct schema
- [ ] ForeignKey relationships are correct
- [ ] Indexes created for performance

### Frontend Integration Testing
- [ ] Home page shows job list with working filters
- [ ] Job list page - all filters work
- [ ] Apply button submits application successfully
- [ ] View my applications page shows applications
- [ ] Save job button works
- [ ] Saved jobs page shows saved jobs

---

## 🎯 CONCLUSION

### Current Status: 🔴 NOT PRODUCTION READY

**Summary:**
- ✅ 25/30 endpoints matched (83%)
- 🔴 4 critical issues blocking production
- 🟡 2 high priority issues
- ⏰ 13-17 hours estimated fix time

**Key Blockers:**
1. POST /applications wrong format
2. GET /posts/public missing filters
3. Application management endpoints missing
4. Saved jobs feature completely missing

**Recommendation:** **DO NOT DEPLOY** to production until all critical issues are resolved.

---

**Report Generated:** 04/04/2026 10:22:17
