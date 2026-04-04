package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import stu.edu.Backend_Nhom10.dto.request.ProfileCVCreationRequest;
import stu.edu.Backend_Nhom10.dto.response.ProfileCVResponse;
import stu.edu.Backend_Nhom10.entity.ProfileCV;

@Mapper(componentModel = "spring",uses = SkillMapper.class)
public interface ProfileCVMapper {
    ProfileCV toEntity(ProfileCVCreationRequest creationRequest);
    ProfileCVResponse toProfileCVResponse(ProfileCV profileCV);
}
