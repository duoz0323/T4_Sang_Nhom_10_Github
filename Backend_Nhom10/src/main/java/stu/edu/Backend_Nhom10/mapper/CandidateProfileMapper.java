package stu.edu.Backend_Nhom10.mapper;

import stu.edu.Backend_Nhom10.dto.request.CandidateProfileRequest;
import stu.edu.Backend_Nhom10.dto.request.RegistrationCandidateRequest;
import stu.edu.Backend_Nhom10.dto.response.CandidateProfileResponse;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CandidateProfileMapper {
    CandidateProfile toProfile(RegistrationCandidateRequest request);
    CandidateProfileResponse toProfileResponse(CandidateProfile candidateProfile);
    
    // Cấu hình bỏ qua các trường null khi update
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfile(@MappingTarget CandidateProfile candidateProfile, CandidateProfileRequest request);
}
