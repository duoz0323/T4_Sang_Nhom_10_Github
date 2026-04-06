package stu.edu.Backend_Nhom10.service;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.PostCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.PostUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.entity.*;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.JobPostingMapper;
import stu.edu.Backend_Nhom10.repository.*;
import stu.edu.Backend_Nhom10.security.SecurityUtils;

import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JobPostingService {
    JobPostingMapper jobPostingMapper;
    JobPostingRepository jobPostingRepository;
    CompanyProfileRepository companyProfileRepository;
    LocationRepository locationRepository;
    IndustryRepository industryRepository;
    SkillRepository skillRepository;
    SecurityUtils securityUtils;
    @PreAuthorize("hasRole('COMPANY')")
    public JobPostingResponse createPost(PostCreateRequest request){
        String userId = securityUtils.getSubject();
        CompanyProfile company = companyProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        JobPosting post = jobPostingMapper.toJobPostingEntity(request);
        post.setCompanyProfile(company);
        //--mapping location
        Set<Location> locations = new HashSet<>(locationRepository.findAllById(request.getLocations()));
        post.setLocations(locations);
        Industry industry = industryRepository.findById(request.getIndustryId())
                .orElseThrow(() -> new AppException(ErrorCode.INDUSTRY_NOT_FOUND));

        post.setIndustry(industry);
        Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
        boolean isValid = skills.stream().allMatch(skill -> skill.getIndustry().getIndustryId().equals(industry.getIndustryId()));
        if(!isValid){
            throw new AppException(ErrorCode.INVALID_SKILL_INDUSTRY);
        }
        post.setSkills(skills);
        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    @PreAuthorize("hasRole('COMPANY')")
    public JobPostingResponse updatePost(String id, PostUpdateRequest updateRequest){
        JobPosting post = jobPostingRepository.findById(id).orElseThrow(
                () ->new AppException(ErrorCode.POST_NOT_EXISTED)
        );
        String userId = securityUtils.getSubject();
        if(companyProfileRepository.findByUserId(userId).isEmpty()){
            throw new AppException(ErrorCode.PROFILE_NOT_FOUND);
        }
        if (post.getStatus() == Status.CLOSED || post.getStatus() == Status.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_ADJUST_POST);
        }
        jobPostingMapper.updatePost(post,updateRequest);
        if (updateRequest.getLocations() != null) {
            Set<Location> locations = new HashSet<>(locationRepository.findAllById(updateRequest.getLocations()));
            post.setLocations(locations);
        }
        Set<Skill> skills = new HashSet<>(skillRepository.findAllById(updateRequest.getSkillIds()));
        post.setSkills(skills);
        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    @PreAuthorize("hasRole('COMPANY')")
    public JobPostingResponse closePost(String id) {
        String companyId = securityUtils.getSubject();
        Optional<CompanyProfile> company = companyProfileRepository.findByUserId(companyId);
        JobPosting post = jobPostingRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (!post.getCompanyProfile().getCompanyProfileId().equals(company.get().getCompanyProfileId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        post.setStatus(Status.CLOSED);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    @PreAuthorize("hasRole('COMPANY')")
    public JobPostingResponse reopen(String id) {
        String companyId = securityUtils.getSubject();
        Optional<CompanyProfile> company = companyProfileRepository.findByUserId(companyId);
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getCompanyProfile().getCompanyProfileId().equals(company.get().getCompanyProfileId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (post.getStatus() != Status.CLOSED && post.getStatus() != Status.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_ADJUST_POST);
        }

        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    @PreAuthorize("hasRole('COMPANY')")
    public List<JobPostingResponse> getMyPosts(){
        String companyId = securityUtils.getSubject();
        Optional<CompanyProfile> company = companyProfileRepository.findByUserId(companyId);
        return jobPostingRepository.findByCompanyProfile_CompanyProfileId(company.get().getCompanyProfileId())
                .stream()
                .map(jobPostingMapper::toJobPostingResponse)
                .toList();
    }
    //=================CANDIDATE==============

    public List<JobPostingResponse> getAllActive() {
        return jobPostingRepository.findByStatusAndDeadlineAfter(Status.ACTIVE,LocalDate.now())
                .stream()
                .map(jobPostingMapper::toJobPostingResponse)
                .toList();
    }
    public JobPostingResponse getPublicPost(String id) {
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (post.getStatus() != Status.ACTIVE) {
            throw new AppException((ErrorCode.POST_NOT_ACTIVE));
        }

        if (post.getDeadline() != null &&
                post.getDeadline().isBefore(LocalDate.now())) {
            throw new AppException(ErrorCode.POST_EXPIRED);
        }

        return jobPostingMapper.toJobPostingResponse(post);
    }
    //=================ADMIN===================
    @PreAuthorize("hasRole('ADMIN')")
    public List<JobPostingResponse> getPendingPosts() {

        return jobPostingRepository.findAllByStatus(Status.PENDING)
                .stream()
                .map(jobPostingMapper::toJobPostingResponse)
                .toList();
    }
    @PreAuthorize("hasRole('ADMIN')")
    public JobPostingResponse updateStatus(String id, Status status) {
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        // Optional: validate logic chuyển trạng thái
        if (post.getStatus() == Status.CLOSED || post.getStatus() == Status.EXPIRED) {
            throw new AppException(ErrorCode.INVALID_ADJUST_POST);
        }

        post.setStatus(status);

        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    //==================SYSTEM=================
    @Scheduled(cron = "0 * * * * ?") // mỗi ngày 0h
    @Transactional
    public void autoExpireJobs() {
        List<JobPosting> jobs = jobPostingRepository
                .findByStatusAndDeadlineIsNotNullAndDeadlineLessThanEqual(Status.ACTIVE,LocalDate.now());

        for (JobPosting job : jobs) {
            job.setStatus(Status.EXPIRED);
        }

        jobPostingRepository.saveAll(jobs);
    }
}
