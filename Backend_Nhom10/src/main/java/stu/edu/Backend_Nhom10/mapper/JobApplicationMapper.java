package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationRequest;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationUpdateRequest;
import stu.edu.Backend_Nhom10.dto.request.PostUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationForHRResponse;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.entity.JobApplication;
import stu.edu.Backend_Nhom10.entity.JobPosting;

@Mapper(componentModel = "spring")
public interface JobApplicationMapper {
    @Mapping(target = "jobPosting", ignore = true)
    @Mapping(target = "candidateProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "appliedAt", ignore = true)
    JobApplication toEntity(JobApplicationRequest request);

    @Mapping(source = "jobPosting.jobPostingId", target = "jobPostingId")
    @Mapping(source = "jobPosting.title",target="title")
    JobApplicationResponse toJobApplicationForCandidateResponse(JobApplication entity);
    JobApplicationForHRResponse toJobApplicationForHRResponse(JobApplication entity);

    void updateJobApplication(@MappingTarget JobApplication application, JobApplicationUpdateRequest update);
}
