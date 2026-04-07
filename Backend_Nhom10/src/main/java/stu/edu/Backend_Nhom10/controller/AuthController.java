package stu.edu.Backend_Nhom10.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.request.LoginRequest;
import stu.edu.Backend_Nhom10.dto.request.RefreshTokenRequest;
import stu.edu.Backend_Nhom10.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthController {
    AuthService authService;
    @PostMapping("/login")
    ApiResponse<TokenExchangeResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.<TokenExchangeResponse>builder()
                .result(authService.login(request))
                .build();
    }
    @PostMapping("/refresh_token")
    ApiResponse<TokenExchangeResponse> refreshToken(@RequestBody @Valid RefreshTokenRequest request) {
        return ApiResponse.<TokenExchangeResponse>builder()
                .result(authService.refreshToken(request))
                .build();
    }
    @PostMapping("/logout")
    ApiResponse<String> logout(@RequestBody @Valid RefreshTokenRequest request) {
        authService.logout(request);
        return ApiResponse.<String>builder()
                .result("logout compeleted")
                .build();
    }
}
