package stu.edu.Backend_Nhom10.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.entity.*;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.JobApplicationMapper;
import stu.edu.Backend_Nhom10.repository.CandidateProfileRepository;
import stu.edu.Backend_Nhom10.repository.JobApplicationRepository;
import stu.edu.Backend_Nhom10.repository.JobPostingRepository;
import stu.edu.Backend_Nhom10.repository.ProfileCVRepository;
import stu.edu.Backend_Nhom10.security.SecurityUtils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobApplicationService {
    JobApplicationRepository jobApplicationRepository;
    JobPostingRepository jobPostingRepository;
    CandidateProfileRepository candidateRepository;
    JobApplicationMapper jobApplicationMapper;
    ProfileCVRepository profileCVRepository;
    SecurityUtils securityUtils;
    Cloudinary cloudinary;
    public JobApplicationResponse apply(JobApplicationRequest request, MultipartFile file) {
        try {
            JobPosting post = jobPostingRepository.findById(request.getJobPostingId())
                    .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

            // Kiểm tra bài đăng tuyển phải ở trạng thái ACTIVE mới được ứng tuyển
            if (post.getStatus() != Status.ACTIVE) {
                throw new AppException(ErrorCode.POST_NOT_ACTIVE);
            }

            String userId = null;
            CandidateProfile candidate = null;
            String name = null;
            String email = null;
            String phone = null;
            String cvUrl = null;
            String cvPublicId = null;
            String fileName = null;

            try {
                userId = securityUtils.getSubject();
                candidate = candidateRepository
                        .findByUserId(userId)
                        .orElseThrow(() -> new AppException(ErrorCode.CANDIDATE_NOT_FOUND));

                boolean exists = jobApplicationRepository
                        .existsByCandidateProfile_CandidateProfileIdAndJobPosting_JobPostingId(
                                candidate.getCandidateProfileId(),
                                post.getJobPostingId()
                        );
                if (exists) {
                    throw new AppException(ErrorCode.ALREADY_APPLIED);
                }

                // Nếu có cvId truyền lên, lấy đúng ProfileCV
                if (request.getProfileCVId() != null && !request.getProfileCVId().isEmpty()) {
                    ProfileCV selectedCV = profileCVRepository.findById(request.getProfileCVId())
                        .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
                    name = selectedCV.getName();
                    email = selectedCV.getEmail();
                    phone = selectedCV.getPhone();
                    cvUrl = selectedCV.getUrlCVPreview();
                    cvPublicId = selectedCV.getCvPublicId();
                    fileName = selectedCV.getFileName();
                } else {
                    // Nếu không có cvId, phải upload file mới
                    if (file == null || file.isEmpty()) {
                        throw new AppException(ErrorCode.FILE_REQUIRED);
                    }
                    String contentType = file.getContentType();
                    if (!List.of(
                            "application/pdf",
                            "application/msword",
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ).contains(contentType)) {
                        throw new AppException(ErrorCode.INVALID_FILE_TYPE);
                    }
                    name = request.getName();
                    email = request.getEmail();
                    phone = request.getPhone();
                    Map<String, String> uploadedData = uploadCVFile(file, candidate.getCandidateProfileId());
                    cvUrl = uploadedData.get("cvUrl");
                    cvPublicId = uploadedData.get("cvPublicId");
                    fileName = uploadedData.get("fileName");
                }
            } catch (IllegalStateException e) {
                // User không login, phải nhập form đầy đủ và upload file
                if (file == null || file.isEmpty()) {
                    throw new AppException(ErrorCode.FILE_REQUIRED);
                }
                if (request.getName() == null || request.getName().isEmpty() ||
                    request.getEmail() == null || request.getEmail().isEmpty() ||
                    request.getPhone() == null || request.getPhone().isEmpty()) {
                    throw new AppException(ErrorCode.NOT_BLANK);
                }
                String contentType = file.getContentType();
                if (!List.of(
                        "application/pdf",
                        "application/msword",
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                ).contains(contentType)) {
                    throw new AppException(ErrorCode.INVALID_FILE_TYPE);
                }
                name = request.getName();
                email = request.getEmail();
                phone = request.getPhone();
                Map<String, String> uploadedData = uploadCVFile(file, phone);
                cvUrl = uploadedData.get("cvUrl");
                cvPublicId = uploadedData.get("cvPublicId");
                fileName = uploadedData.get("fileName");
            }

            JobApplication jobApplication = new JobApplication();
            jobApplication.setName(name);
            jobApplication.setEmail(email);
            jobApplication.setPhone(phone);
            jobApplication.setCvPublicId(cvPublicId);
            jobApplication.setAppliedAt(LocalDateTime.now());
            jobApplication.setStatus(Status.PENDING);
            jobApplication.setJobPosting(post);
            jobApplication.setUrlCV(cvUrl);
            jobApplication.setFileName(fileName);
            if (candidate != null) {
                jobApplication.setCandidateProfile(candidate);
            }
            return jobApplicationMapper.toJobApplicationForCandidateResponse(jobApplicationRepository.save(jobApplication));
        } catch (IOException e) {
            throw new RuntimeException("Upload CV failed", e);
        }
    }

    // Helper method để upload CV file
    private Map<String, String> uploadCVFile(MultipartFile file, String identifier) throws IOException {
        // Lấy extension (đuôi file)
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf(".") + 1);
        }

        // Tạo tên file
        String filename = "cv_" + identifier + "_" + System.currentTimeMillis();
        if (!extension.isEmpty()) {
            filename += "." + extension;
        }

        // Upload lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder","ForNoCV",
                        "resource_type", "raw", // cho file document
                        "public_id", filename,
                        "format", extension // thêm format để tránh bị N/A
                )
        );

        String publicId = uploadResult.get("public_id").toString();
        String cvUrl = uploadResult.get("secure_url").toString();

        return Map.of(
                "cvPublicId", publicId,
                "cvUrl", cvUrl,
                "fileName", filename
        );
    }
    public JobApplicationResponse apply_quick(JobApplicationRequest request, String jobPostingId) {
        String userId = securityUtils.getSubject();
        CandidateProfile candidate = candidateRepository
                    .findByUserId(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));

            // Lấy ProfileCV mặc định - nếu không có thì báo lỗi
            ProfileCV defaultProfileCV = profileCVRepository
                    .findByCandidateProfile_UserIdAndIsDefaultTrue(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_PROFILE_DEFAULT));

            JobPosting post = jobPostingRepository.findById(jobPostingId)
                    .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

            // Kiểm tra bài đăng tuyển phải ở trạng thái ACTIVE mới được ứng tuyển
            if (post.getStatus() != Status.ACTIVE) {
                throw new AppException(ErrorCode.POST_NOT_ACTIVE);
            }

            // Kiểm tra đơn này tồn tại chưa
            boolean exists = jobApplicationRepository
                    .existsByCandidateProfile_CandidateProfileIdAndJobPosting_JobPostingId(
                            candidate.getCandidateProfileId(),
                            post.getJobPostingId()
                    );

            if (exists) {
                throw new AppException(ErrorCode.ALREADY_APPLIED);
            }

            // Tạo JobApplication từ ProfileCV mặc định hoặc từ request nếu có chỉnh sửa
            JobApplication jobApplication = new JobApplication();
            
            // Nếu request có thông tin mới, dùng nó; nếu không dùng từ ProfileCV mặc định
            jobApplication.setName(request.getName() != null && !request.getName().isEmpty() 
                    ? request.getName() 
                    : defaultProfileCV.getName());
            jobApplication.setEmail(request.getEmail() != null && !request.getEmail().isEmpty() 
                    ? request.getEmail() 
                    : defaultProfileCV.getEmail());
            jobApplication.setPhone(request.getPhone() != null && !request.getPhone().isEmpty() 
                    ? request.getPhone() 
                    : defaultProfileCV.getPhone());
            
            jobApplication.setStatus(Status.PENDING);
            jobApplication.setAppliedAt(LocalDateTime.now());
            jobApplication.setCandidateProfile(candidate);
            jobApplication.setJobPosting(post);

            // Lấy thông tin CV từ ProfileCV mặc định
            jobApplication.setCvPublicId(defaultProfileCV.getCvPublicId());
            jobApplication.setUrlCV(defaultProfileCV.getUrlCVPreview());
            jobApplication.setFileName(defaultProfileCV.getFileName());

            return jobApplicationMapper.toJobApplicationForCandidateResponse(jobApplicationRepository.save(jobApplication));
    }

    // Lấy ProfileCV mặc định để xem trước trước khi ứng tuyển nhanh
    public ProfileCV getDefaultProfileCV() {
        String userId = securityUtils.getSubject();

        return profileCVRepository
                .findByCandidateProfile_UserIdAndIsDefaultTrue(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
    }
    public JobApplicationResponse withdrawApplication(String applicationId) {
        String userId = securityUtils.getSubject();

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        if (!application.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // Kiểm tra chỉ được rút đơn khi còn ở trạng thái PENDING
        if (application.getStatus() != Status.PENDING) {
            throw new AppException(ErrorCode.ALREADY_PROCESSED);
        }

        // Cập nhật trạng thái thành WITHDRAWN thay vì xóa cứng
        application.setStatus(Status.WITHDRAWN);
        return jobApplicationMapper.toJobApplicationForCandidateResponse(
                jobApplicationRepository.save(application)
        );
    }
    public List<JobApplicationResponse> getApplicationsByJob(String jobPostingId) {

        List<JobApplication> list = jobApplicationRepository
                .findByJobPosting_jobPostingId(jobPostingId);

        return list.stream()
                .map(jobApplicationMapper::toJobApplicationForCandidateResponse)
                .toList();
    }
    public List<JobApplicationResponse> getMyApplications() {
        String userId = securityUtils.getSubject();

        List<JobApplication> list = jobApplicationRepository
                .findByCandidateProfile_UserId(userId);

        return list.stream()
                .map(jobApplicationMapper::toJobApplicationForCandidateResponse)
                .toList();
    }
    public JobApplicationResponse updateApplicationStatus(String applicationId, Status status) {

        String userId = securityUtils.getSubject();

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // check company sở hữu job
        if (!application.getJobPosting()
                .getCompanyProfile()
                .getUserId()
                .equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // không cho update lại nếu đã xử lý
        if (application.getStatus() != Status.PENDING) {
            throw new AppException(ErrorCode.ALREADY_PROCESSED);
        }

        application.setStatus(status);

        return jobApplicationMapper.toJobApplicationForCandidateResponse(
                jobApplicationRepository.save(application)
        );
    }
    // Lấy chi tiết đơn nộp by ID
    public JobApplicationResponse getApplicationById(String applicationId) {
        String userId = securityUtils.getSubject();

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        // Kiểm tra xem user hiện tại có phải là chủ nhân của đơn không
        if (!application.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return jobApplicationMapper.toJobApplicationForCandidateResponse(application);
    }
}
