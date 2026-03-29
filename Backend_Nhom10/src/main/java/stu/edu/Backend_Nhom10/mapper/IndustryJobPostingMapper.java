package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import stu.edu.Backend_Nhom10.dto.response.IndustryJobPostingResponse;
import stu.edu.Backend_Nhom10.entity.JobIndustry;

@Mapper(componentModel = "spring",uses = {SkillJobPostingMapper.class})
public interface IndustryJobPostingMapper {

    @Mapping(source = "industry.industryId", target = "industryId")
    @Mapping(source = "industry.nameIndustry", target = "nameIndustry")
    @Mapping(source = "jobSkills", target = "skills")
    IndustryJobPostingResponse toResponse(JobIndustry jobIndustry);
}
