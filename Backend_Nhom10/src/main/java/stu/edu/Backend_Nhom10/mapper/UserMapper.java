package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import stu.edu.Backend_Nhom10.dto.request.UserRequest;
import stu.edu.Backend_Nhom10.dto.response.UserResponse;
import stu.edu.Backend_Nhom10.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserRequest request);
    UserResponse toUserResponse(User user);
    void updateUser(@MappingTarget User user, UserRequest userRequest);
}
