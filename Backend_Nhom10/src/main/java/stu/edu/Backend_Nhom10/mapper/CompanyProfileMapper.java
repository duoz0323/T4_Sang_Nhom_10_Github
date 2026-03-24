package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.*;
import stu.edu.Backend_Nhom10.dto.request.CompanyProfileRequest;
import stu.edu.Backend_Nhom10.dto.request.RegistrationCompanyRequest;
import stu.edu.Backend_Nhom10.dto.response.CompanyProfileResponse;
import stu.edu.Backend_Nhom10.entity.CompanyProfile;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanyProfileMapper {
    CompanyProfile toProfile(RegistrationCompanyRequest request);
    CompanyProfileResponse toProfileResponse(CompanyProfile companyProfile);
    
    // Cấu hình bỏ qua các trường null khi update
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfile(@MappingTarget CompanyProfile companyProfile, CompanyProfileRequest request);
}
