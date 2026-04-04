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
import stu.edu.Backend_Nhom10.dto.request.JobApplicationUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationForHRResponse;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.entity.CompanyProfile;
import stu.edu.Backend_Nhom10.entity.JobApplication;
import stu.edu.Backend_Nhom10.entity.JobPosting;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.JobApplicationMapper;
import stu.edu.Backend_Nhom10.mapper.JobPostingMapper;
import stu.edu.Backend_Nhom10.repository.CandidateProfileRepository;
import stu.edu.Backend_Nhom10.repository.JobApplicationRepository;
import stu.edu.Backend_Nhom10.repository.JobPostingRepository;
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
    SecurityUtils securityUtils;
    Cloudinary cloudinary;
    public JobApplicationResponse apply(JobApplicationRequest request, MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new AppException(ErrorCode.FILE_REQUIRED);
            }
            //Chỗ này để kiểm tra chỉ nhận file docx,pdf,word
            String contentType = file.getContentType();
            if (!List.of(
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ).contains(contentType)) {
                throw new AppException(ErrorCode.INVALID_FILE_TYPE);
            }
            String userId = securityUtils.getObject();
            CandidateProfile candidate = candidateRepository
                    .findByUserId(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
            JobPosting post = jobPostingRepository.findById(request.getJobPostingId())
                    .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

            //xem đơn này tồn tại chưa
            boolean exists = jobApplicationRepository
                    .existsByCandidateProfile_CandidateProfileIdAndJobPosting_JobPostingId(
                            candidate.getCandidateProfileId(),
                            post.getJobPostingId()
                    );

            if (exists) {
                throw new AppException(ErrorCode.ALREADY_APPLIED);
            }
            // Lấy extension (đuôi file)
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".") + 1);
            }
            // Tạo tên file: cv_userId_timestamp
            String filename = "cv_" + candidate.getCandidateProfileId() + "_" + System.currentTimeMillis();
            if (!extension.isEmpty()) {
                filename += "." + extension;
            }

            // Upload lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder","ForCVCandidate",
                            "resource_type", "raw", // cho file document
                            "public_id", filename,
                            "format", extension // thêm format để tránh bị N/A
                    )
            );

            String publicId = uploadResult.get("public_id").toString();
            String cvUrl = uploadResult.get("secure_url").toString();

            JobApplication jobApplication = jobApplicationMapper.toEntity(request);
            jobApplication.setCvPublicId(publicId);
            jobApplication.setAppliedAt(LocalDateTime.now());
            jobApplication.setCandidateProfile(candidate);
            jobApplication.setStatus(Status.PENDING);
            jobApplication.setJobPosting(post);
            jobApplication.setUrlCV(cvUrl);
            jobApplication.setFileName(filename);
            return jobApplicationMapper.toJobApplicationForCandidateResponse(jobApplicationRepository.save(jobApplication));
        }catch (IOException e){
            throw new RuntimeException("Upload CV failed",e);
        }
    }
    public void deleteApplication(String applicationId) throws IOException {
        String userId = securityUtils.getObject();

        JobApplication application = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

        if (!application.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (application.getCvPublicId() != null) {
            cloudinary.uploader().destroy(
                    application.getCvPublicId(),
                    Map.of("resource_type", "raw")
            );
        }
        jobApplicationRepository.delete(application);
    }
    public JobApplicationResponse updateApplication(String applicationId, JobApplicationUpdateRequest request , MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                throw new AppException(ErrorCode.FILE_REQUIRED);
            }

            String userId = securityUtils.getObject();

            JobApplication application = jobApplicationRepository.findById(applicationId)
                    .orElseThrow(() -> new AppException(ErrorCode.APPLICATION_NOT_FOUND));

            if (!application.getCandidateProfile().getUserId().equals(userId)) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }
            if (application.getStatus() != Status.PENDING) {
                throw new AppException(ErrorCode.ALREADY_PROCESSED);
            }

            jobApplicationMapper.updateJobApplication(application,request);
            // upload lại file mới
            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf(".") + 1);
            }
            String filenames = "cv_" + application.getCandidateProfile().getCandidateProfileId() + "_" + System.currentTimeMillis();
            if (!extension.isEmpty()) {
                filenames += "." + extension;
            }
            log.info(filenames);
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "folder", "ForCVCandidate",
                            "resource_type", "raw",
                            "public_id", filenames,
                            "format", extension
                    )
            );
            String realPublicId = uploadResult.get("public_id").toString();
            if (application.getCvPublicId() != null) {
                cloudinary.uploader().destroy(
                        application.getCvPublicId(),
                        Map.of("resource_type", "raw")
                );
            }
            String cvUrl = uploadResult.get("secure_url").toString();
            application.setFileName(filenames);
            application.setUrlCV(cvUrl);
            application.setCvPublicId(realPublicId);

            return jobApplicationMapper.toJobApplicationForCandidateResponse(
                    jobApplicationRepository.save(application)
            );

        } catch (IOException e) {
            throw new RuntimeException("Update CV failed", e);
        }
    }
    public List<JobApplicationForHRResponse> getApplicationsByJob(String jobPostingId) {

        List<JobApplication> list = jobApplicationRepository
                .findByJobPosting_jobPostingId(jobPostingId);

        return list.stream()
                .map(jobApplicationMapper::toJobApplicationForHRResponse)
                .toList();
    }
    public List<JobApplicationResponse> getMyApplications() {
        String userId = securityUtils.getObject();

        List<JobApplication> list = jobApplicationRepository
                .findByCandidateProfile_UserId(userId);

        return list.stream()
                .map(jobApplicationMapper::toJobApplicationForCandidateResponse)
                .toList();
    }
    public JobApplicationForHRResponse updateApplicationStatus(String applicationId, Status status) {

        String userId = securityUtils.getObject();

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

        return jobApplicationMapper.toJobApplicationForHRResponse(
                jobApplicationRepository.save(application)
        );
    }
}
