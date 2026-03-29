package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import stu.edu.Backend_Nhom10.dto.request.IndustryCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.IndustryResponse;
import stu.edu.Backend_Nhom10.entity.Industry;

@Mapper(componentModel = "spring")
public interface IndustryMapper {
    Industry toIndustryEntity(IndustryCreateRequest request);
    IndustryResponse toIndustryResponse(Industry entity);
}
