package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import stu.edu.Backend_Nhom10.dto.response.SkillJobPostingResponse;
import stu.edu.Backend_Nhom10.entity.JobSkill;

@Mapper(componentModel = "spring")
public interface SkillJobPostingMapper {
    @Mapping(source = "skill.skillId", target = "skillId")
    @Mapping(source = "skill.skillName", target = "skillName")
    SkillJobPostingResponse toResponse(JobSkill jobSkill);
}
