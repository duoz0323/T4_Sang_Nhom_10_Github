package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import stu.edu.Backend_Nhom10.dto.request.SkillRequest;
import stu.edu.Backend_Nhom10.dto.response.SkillResponse;
import stu.edu.Backend_Nhom10.entity.Skill;

@Mapper(componentModel = "spring")
public interface SkillMapper {
    Skill toSkillEntity(SkillRequest request);
    @Mapping(source = "industry.industryId", target = "industryId")
    SkillResponse toSkillResponse(Skill skill);
    void updateSkill(@MappingTarget Skill user, SkillRequest request);
}
