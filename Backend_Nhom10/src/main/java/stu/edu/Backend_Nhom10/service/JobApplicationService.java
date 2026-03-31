package stu.edu.Backend_Nhom10.service;

import com.cloudinary.Cloudinary;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationRequest;
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

            boolean exists = jobApplicationRepository
                    .existsByCandidateProfile_CandidateProfileIdAndJobPosting_JobPostingId(
                            candidate.getCandidateProfileId(),
                            post.getJobPostingId()
                    );

            if (exists) {
                throw new AppException(ErrorCode.ALREADY_APPLIED);
            }
            // 5. Lấy extension (đuôi file)
            String originalName = file.getOriginalFilename();
            String extension = originalName.substring(originalName.lastIndexOf(".") + 1);

            // 6. Tạo tên file: cv_userId_timestamp
            String publicId = "cv_" + candidate.getCandidateProfileId() + "_" + System.currentTimeMillis();

            // 7. Upload lên Cloudinary
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    Map.of(
                            "folder", "forCVCandidate",
                            "resource_type", "raw", // 🔥 cho file document
                            "public_id", publicId,
                            "format", extension // giữ đúng đuôi file
                    )
            );

            String cvUrl = uploadResult.get("secure_url").toString();

            JobApplication jobApplication = jobApplicationMapper.toEntity(request);
            jobApplication.setAppliedAt(LocalDateTime.now());
            jobApplication.setCandidateProfile(candidate);
            jobApplication.setStatus(Status.PENDING);
            jobApplication.setJobPosting(post);
            jobApplication.setUrlCV(cvUrl);
            jobApplication.setFileName(file.getOriginalFilename());
            return jobApplicationMapper.toJobApplicationForCandidateResponse(jobApplicationRepository.save(jobApplication));
        }catch (IOException e){
            throw new RuntimeException("Upload CV failed",e);
        }
    }
}
