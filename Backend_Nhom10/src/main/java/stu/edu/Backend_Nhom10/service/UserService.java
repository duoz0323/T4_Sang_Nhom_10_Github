package stu.edu.Backend_Nhom10.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.UserRequest;
import stu.edu.Backend_Nhom10.dto.response.UserResponse;
import stu.edu.Backend_Nhom10.entity.User;
import stu.edu.Backend_Nhom10.mapper.UserMapper;
import stu.edu.Backend_Nhom10.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse getUserbyId(Long userId) {
        return userMapper.toUserResponse(userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("loi roi cu")));
    }

    public UserResponse createuser(UserRequest request) {
        User user = userMapper.toUser(request);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(Long userId,UserRequest request) {
        User user=userRepository.findById(userId).
                orElseThrow(() -> new RuntimeException("loi roi nha cu"));
        userMapper.updateUser(user,request);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(Long userId) {
        User user=userRepository.findById(userId).
                orElseThrow(() -> new RuntimeException("loi roi nha cu"));
        userRepository.deleteById(userId);
    }
}
