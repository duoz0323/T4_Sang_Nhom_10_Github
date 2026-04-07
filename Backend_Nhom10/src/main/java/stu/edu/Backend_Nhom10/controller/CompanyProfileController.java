package stu.edu.Backend_Nhom10.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.request.CompanyProfileRequest;
import stu.edu.Backend_Nhom10.dto.request.LoginRequest;
import stu.edu.Backend_Nhom10.dto.request.RegistrationCompanyRequest;
import stu.edu.Backend_Nhom10.dto.response.CompanyProfileResponse;
import stu.edu.Backend_Nhom10.service.CompanyProfileService;

import java.util.List;

@RestController
@RequestMapping("/company_profile")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CompanyProfileController {
    CompanyProfileService companyProfileService;

    @PostMapping("/register")
    ApiResponse<CompanyProfileResponse> register(@RequestBody @Valid RegistrationCompanyRequest request) {
        return ApiResponse.<CompanyProfileResponse>builder()
                .result(companyProfileService.register(request))
                .build();
    }
    @GetMapping("/profiles")
    ApiResponse<List<CompanyProfileResponse>> getAllProfiles() {
        return ApiResponse.<List<CompanyProfileResponse>>builder()
                .result(companyProfileService.getAllProfiles())
                .build();
    }

    @GetMapping("/{profileId}")
    ApiResponse<CompanyProfileResponse> getProfileById(@PathVariable @Valid String profileId) {
        return ApiResponse.<CompanyProfileResponse>builder()
                .result(companyProfileService.getProfileById(profileId))
                .build();
    }
    @GetMapping("/my-profile")
    ApiResponse<CompanyProfileResponse> getProfile() {
        return ApiResponse.<CompanyProfileResponse>builder()
                .result(companyProfileService.getMyProfile())
                .build();
    }
    @PutMapping("/{profileId}")
    ApiResponse<CompanyProfileResponse> updateMyProfile(@RequestBody @Valid CompanyProfileRequest request) {
        return ApiResponse.<CompanyProfileResponse>builder()
                .result(companyProfileService.updateMyProfile(request))
                .build();
    }

    @DeleteMapping("/{profileId}")
    ApiResponse<String> deleteProfile(@PathVariable("profileId") String profileId) {
        companyProfileService.deleteProfile(profileId);
        return ApiResponse.<String>builder()
                .result("Profile and Keycloak User have been deleted")
                .build();
    }
}
