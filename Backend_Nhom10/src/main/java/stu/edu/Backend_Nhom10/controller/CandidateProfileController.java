package stu.edu.Backend_Nhom10.controller;

import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.request.LoginRequest;
import stu.edu.Backend_Nhom10.dto.request.CandidateProfileRequest;
import stu.edu.Backend_Nhom10.dto.request.RegistrationCandidateRequest;
import stu.edu.Backend_Nhom10.dto.response.CandidateProfileResponse;
import stu.edu.Backend_Nhom10.service.CandidateProfileService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/candidate_profile")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CandidateProfileController {
    CandidateProfileService candidateProfileService;

    @PostMapping("/register")
    ApiResponse<CandidateProfileResponse> register(@RequestBody @Valid RegistrationCandidateRequest request) {
        return ApiResponse.<CandidateProfileResponse>builder()
                .result(candidateProfileService.register(request))
                .build();
    }
    @PostMapping("/login")
    ApiResponse<TokenExchangeResponse> login(@RequestBody @Valid LoginRequest request) {
        return ApiResponse.<TokenExchangeResponse>builder()
                .result(candidateProfileService.login(request))
                .build();
    }
    @GetMapping("/profiles")
    ApiResponse<List<CandidateProfileResponse>> getAllProfiles() {
            return ApiResponse.<List<CandidateProfileResponse>>builder()
                    .result(candidateProfileService.getAllProfiles())
                    .build();
    }

    @GetMapping("/{profileId}")
    ApiResponse<CandidateProfileResponse> getProfileById(@PathVariable @Valid String profileId) {
        return ApiResponse.<CandidateProfileResponse>builder()
                .result(candidateProfileService.getProfileById(profileId))
                .build();
    }
    @GetMapping("/my-profile")
    ApiResponse<CandidateProfileResponse> getProfile() {
        return ApiResponse.<CandidateProfileResponse>builder()
                .result(candidateProfileService.getMyProfile())
                .build();
    }
    @PutMapping("/{profileId}")
    ApiResponse<CandidateProfileResponse> updateMyProfile(@RequestBody @Valid CandidateProfileRequest request) {
        return ApiResponse.<CandidateProfileResponse>builder()
                .result(candidateProfileService.updateMyProfile(request))
                .build();
    }

    @DeleteMapping("/{profileId}")
    ApiResponse<String> deleteProfile(@PathVariable("profileId") String profileId) {
        candidateProfileService.deleteProfile(profileId);
        return ApiResponse.<String>builder()
                .result("Profile and Keycloak User have been deleted")
                .build();
    }
}
