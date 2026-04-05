package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.entity.JobApplication;
import stu.edu.Backend_Nhom10.entity.JobPosting;

@Mapper(componentModel = "spring",uses = {CandidateProfileMapper.class, JobPosting.class})
public interface JobApplicationMapper {
    @Mapping(target = "jobPosting", ignore = true)
    @Mapping(target = "candidateProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "appliedAt", ignore = true)
    JobApplication toEntity(JobApplicationRequest request);

    JobApplicationResponse toJobApplicationForCandidateResponse(JobApplication entity);

}
