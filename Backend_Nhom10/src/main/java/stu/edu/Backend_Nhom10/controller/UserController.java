package stu.edu.Backend_Nhom10.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.UserRequest;
import stu.edu.Backend_Nhom10.dto.response.UserResponse;
import stu.edu.Backend_Nhom10.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;
    @GetMapping
    ApiResponse<List<UserResponse>> getAllUsers()
    {
        return ApiResponse.<List<UserResponse>>builder()
                .result(userService.getAllUsers())
                .build();
    }
    @GetMapping("/{userId}")
    ApiResponse<UserResponse> getUserbyId(@PathVariable("userId") Long userId )
    {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserbyId(userId))
                .build();
    }
    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody UserRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createuser(request))
                .build();
    }
    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable("userId") Long userId
    ,@RequestBody UserRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(userId,request))
                .build();
    }
    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable("userId") Long userId) {
        userService.deleteUser(userId);
        return ApiResponse.<String>builder()
                .result("User has been deleted")
                .build();
    }
}
