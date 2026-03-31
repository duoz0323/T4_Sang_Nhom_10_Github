package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import stu.edu.Backend_Nhom10.dto.request.PostCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.PostUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.entity.JobPosting;


@Mapper(componentModel = "spring",uses = {SkillMapper.class})
public interface JobPostingMapper {
    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "companyProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    JobPosting toJobPostingEntity(PostCreateRequest request);

    @Mapping(source = "companyProfile", target = "companyProfile")
    JobPostingResponse toJobPostingResponse(JobPosting entity);

    @Mapping(target = "locations", ignore = true)
    @Mapping(target = "companyProfile", ignore = true)
    @Mapping(target = "status", ignore = true)
    void updatePost(@MappingTarget JobPosting jobPosting, PostUpdateRequest update);
}
