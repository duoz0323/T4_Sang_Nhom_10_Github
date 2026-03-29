package stu.edu.Backend_Nhom10.service;

import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.IndustryJobRequest;
import stu.edu.Backend_Nhom10.dto.request.JobCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.JobUpdateRequest;
import stu.edu.Backend_Nhom10.dto.request.common.HasIndustryRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.entity.*;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.JobPostingMapper;
import stu.edu.Backend_Nhom10.repository.*;
import stu.edu.Backend_Nhom10.security.SecurityUtils;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

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
    public JobPostingResponse createPost(JobCreateRequest request){
        String userId = securityUtils.getCurrentCompanyId();
        CompanyProfile company = companyProfileRepository
                .findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        JobPosting post = jobPostingMapper.toJobPostingEntity(request);
        post.setCompanyProfile(company);
        //--mapping location
        Set<Location> locations = new HashSet<>(locationRepository.findAllById(request.getLocations()));
        post.setLocations(locations);
        //--mapping industries + skills
        Set<JobIndustry> jobIndustries = buildJobIndustries(request, post);
        post.setIndustries(jobIndustries);
        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }

    public JobPostingResponse updatePost(String id,JobUpdateRequest updateRequest){
        JobPosting post = jobPostingRepository.findById(id).orElseThrow(
                () ->new AppException(ErrorCode.POST_NOT_EXISTED)
        );
        if (post.getStatus() == Status.CLOSED || post.getStatus() == Status.EXPIRED) {
            throw new AppException(ErrorCode.NOT_UPDATE_POST);
        }
        jobPostingMapper.updatePost(post,updateRequest);
        if (updateRequest.getLocations() != null) {
            Set<Location> locations = new HashSet<>(locationRepository.findAllById(updateRequest.getLocations()));
            post.setLocations(locations);
        }

        // ===== update industries + skills =====
        if (updateRequest.getIndustries() != null) {
            post.getIndustries().clear(); // orphanRemoval sẽ auto xóa
            Set<JobIndustry> jobIndustries = buildJobIndustries(updateRequest, post);
            post.setIndustries(jobIndustries);
        }
        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    private Set<JobIndustry> buildJobIndustries(HasIndustryRequest request, JobPosting post) {

        // ===== preload industries =====
        List<String> industryNames = request.getIndustries().stream()
                .map(IndustryJobRequest::getNameIndustry)
                .toList();

        List<Industry> industries = industryRepository.findByNameIndustryIn(industryNames);

        Map<String, Industry> industryMap = industries.stream()
                .collect(Collectors.toMap(Industry::getNameIndustry, Function.identity()));

        return request.getIndustries().stream().map(req -> {

            Industry industry = industryMap.get(req.getNameIndustry());
            if (industry == null) {
                throw new AppException(ErrorCode.INDUSTRY_NOT_FOUND);
            }

            JobIndustry jobIndustry = new JobIndustry();
            jobIndustry.setJobPosting(post);
            jobIndustry.setIndustry(industry);

            // ===== preload skills =====
            List<Skill> skills = skillRepository.findAllById(req.getSkillIds());

            Map<Long, Skill> skillMap = skills.stream()
                    .collect(Collectors.toMap(Skill::getSkillId, Function.identity()));

            Set<JobSkill> jobSkills = req.getSkillIds().stream().map(skillId -> {

                Skill skill = skillMap.get(skillId);

                if (skill == null) {
                    throw new AppException(ErrorCode.SKILL_NOT_FOUND);
                }

                // 🔥 validate skill thuộc industry
                if (!skill.getIndustry().getIndustryId()
                        .equals(industry.getIndustryId())) {
                    throw new AppException(ErrorCode.SKILL_NOT_BELONG_TO_INDUSTRY);
                }

                JobSkill js = new JobSkill();
                js.setJobIndustry(jobIndustry);
                js.setSkill(skill);

                return js;

            }).collect(Collectors.toSet());

            jobIndustry.setJobSkills(jobSkills);

            return jobIndustry;

        }).collect(Collectors.toSet());
    }

    public JobPostingResponse closePost(String id) {
        String companyId = securityUtils.getCurrentCompanyId();
        JobPosting post = jobPostingRepository.findById(id)
                        .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        if (!post.getCompanyProfile().getCompanyProfileId().equals(companyId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        post.setStatus(Status.CLOSED);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    public JobPostingResponse reopen(String id) {
        String companyId = securityUtils.getCurrentCompanyId();
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        if (!post.getCompanyProfile().getCompanyProfileId().equals(companyId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (post.getStatus() != Status.CLOSED && post.getStatus() != Status.EXPIRED) {
            throw new AppException(ErrorCode.NOT_UPDATE_POST);
        }

        post.setStatus(Status.PENDING);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }

    public List<JobPostingResponse> getMyJobs(){
        String companyId = securityUtils.getCurrentCompanyId();
        return jobPostingRepository.findByCompanyProfile_CompanyProfileId(companyId)
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
    public JobPostingResponse getPublicJob(String id) {
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
    public List<JobPostingResponse> getPendingJobs() {

        return jobPostingRepository.findAllByStatus(Status.PENDING)
                .stream()
                .map(jobPostingMapper::toJobPostingResponse)
                .toList();
    }
    public JobPostingResponse approve(String id) {
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        post.setStatus(Status.ACTIVE);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    public JobPostingResponse reject(String id) {
        JobPosting post = jobPostingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));

        post.setStatus(Status.REJECTED);
        return jobPostingMapper.toJobPostingResponse(jobPostingRepository.save(post));
    }
    //==================SYSTEM=================
    @Scheduled(cron = "0 0 0 * * ?") // mỗi ngày 0h
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
