package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import stu.edu.Backend_Nhom10.dto.request.JobCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.JobUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.entity.JobPosting;


@Mapper(componentModel = "spring")
public interface JobPostingMapper {
    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "industries", ignore = true)
    @Mapping(target = "companyProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    JobPosting toJobPostingEntity(JobCreateRequest request);
    JobPostingResponse toJobPostingResponse(JobPosting entity);

    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "industries", ignore = true)
    @Mapping(target = "companyProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updatePost(@MappingTarget JobPosting jobPosting, JobUpdateRequest update);
}
