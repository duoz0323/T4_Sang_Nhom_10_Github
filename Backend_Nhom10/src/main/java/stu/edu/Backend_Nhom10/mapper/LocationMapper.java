package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import stu.edu.Backend_Nhom10.dto.request.LocationRequest;
import stu.edu.Backend_Nhom10.dto.response.LocationResponse;
import stu.edu.Backend_Nhom10.entity.Location;

@Mapper(componentModel = "spring")
public interface LocationMapper {
    Location toLocationEntity(LocationRequest request);
    LocationResponse toLocationResponse(Location entity);
}
