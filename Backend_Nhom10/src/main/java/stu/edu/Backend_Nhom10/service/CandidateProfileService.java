package stu.edu.Backend_Nhom10.service;

import stu.edu.Backend_Nhom10.dto.identity.Credential;
import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.identity.UserCreationParam;
import stu.edu.Backend_Nhom10.dto.identity.RoleRepresentation;
import stu.edu.Backend_Nhom10.dto.request.LoginRequest;
import stu.edu.Backend_Nhom10.dto.request.CandidateProfileRequest;
import stu.edu.Backend_Nhom10.dto.request.RegistrationCandidateRequest;
import stu.edu.Backend_Nhom10.dto.response.CandidateProfileResponse;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.exception.ErrorNormalizer;
import stu.edu.Backend_Nhom10.mapper.CandidateProfileMapper;
import stu.edu.Backend_Nhom10.repository.IdentityClient;
import stu.edu.Backend_Nhom10.repository.CandidateProfileRepository;
import feign.FeignException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CandidateProfileService {
    CandidateProfileRepository profileRepository;
    CandidateProfileMapper profileMapper;
    IdentityClient identityClient;
    ErrorNormalizer errorNormalizer;

    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;

    @PreAuthorize("hasRole('ADMIN')")
    public List<CandidateProfileResponse> getAllProfiles() {
        var profiles = profileRepository.findAll();
        return profiles.stream().map(profileMapper::toProfileResponse).toList();
    }

    @PreAuthorize("hasAnyRole('CANDIDATE')")
    public CandidateProfileResponse getMyProfile() {
        log.info("getMyProfile đã được gọi");
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = profileRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return profileMapper.toProfileResponse(profile);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE')")
    public CandidateProfileResponse updateMyProfile(CandidateProfileRequest request) {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String userId = authentication.getName();

        var profile = profileRepository.findByUserId(userId).orElseThrow(
                () -> new AppException(ErrorCode.USER_NOT_EXISTED));

        // 1. Update DB
        profileMapper.updateProfile(profile, request);
        profile = profileRepository.save(profile);

        //không cần update keycloak vì keycloak chỉ quản lý email,password

        return profileMapper.toProfileResponse(profile);
    }

    public CandidateProfileResponse register(RegistrationCandidateRequest request) {
        try {
            String token = getAdminToken();

            var creationResponse = identityClient.createUser(
                    "Bearer " + token,
                    UserCreationParam.builder()
                            //đồng bộ username và email điều là email
                            .username(request.getEmail())
                            .email(request.getEmail())
                            .enabled(true)
                            .emailVerified(true)
                            .credentials(List.of(Credential.builder()
                                    .type("password")
                                    .temporary(false)
                                    .value(request.getPassword())
                                    .build()))
                            .build());

            String userId = extractUserId(creationResponse);
            log.info("UserId {}", userId);

            // Gán role CANDIDATE cho user
            try {
                // Lấy thông tin Role CANDIDATE từ Keycloak
                RoleRepresentation candidateRole = identityClient.getRoleByName("Bearer " + token, "CANDIDATE");
                
                // Gán role
                identityClient.assignRole(
                        "Bearer " + token,
                        userId,
                        List.of(candidateRole)
                );
                log.info("Đã gán thành công Role CANDIDATE cho User {}", userId);
            } catch (Exception e) {
                log.warn("Không thể gán role cho User {}: {}", userId, e.getMessage());
            }

            var profile = profileMapper.toProfile(request);
            profile.setUserId(userId);

            profile = profileRepository.save(profile);

            return profileMapper.toProfileResponse(profile);
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }

    public TokenExchangeResponse login(@Valid LoginRequest request) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("grant_type", "password");
            params.put("client_id", clientId);
            params.put("client_secret", clientSecret);
            //dùng email thay username
            params.put("username",  request.getEmail());
            params.put("password", request.getPassword());
            params.put("scope", "openid");

            return identityClient.exchangeToken(params);
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteProfile(String profileId) {
        CandidateProfile candidateProfile = profileRepository.findById(profileId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        String userId = candidateProfile.getUserId();

        try {
            String token = getAdminToken();
            identityClient.deleteUser("Bearer " + token, userId);
            log.info("Deleted user {} in Keycloak", userId);
        } catch (Exception e) {
            log.warn("Failed to delete user {} in Keycloak: {}", userId, e.getMessage());
        }

        profileRepository.delete(candidateProfile);
        log.info("Deleted profile {}", profileId);
    }

    private String getAdminToken() {
        Map<String, String> params = new HashMap<>();
        params.put("grant_type", "client_credentials");
        params.put("client_id", clientId);
        params.put("client_secret", clientSecret);
        params.put("scope", "openid");

        var token = identityClient.exchangeToken(params);
        return token.getAccessToken();
    }

    private String extractUserId(ResponseEntity<?> response) {
        if (response.getHeaders().get("Location") == null || response.getHeaders().get("Location").isEmpty()) {
            throw new RuntimeException("Tạo User thất bại hoặc không lấy được Location Header");
        }
        String location = response.getHeaders().get("Location").getFirst();
        String[] splitedStr = location.split("/");
        return splitedStr[splitedStr.length - 1];
    }

    @PreAuthorize("hasAnyRole('CANDIDATE')")
    public CandidateProfileResponse getProfileById(@Valid String profileId) {
        var profile = profileRepository.findById(profileId).orElseThrow(
                () -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        return profileMapper.toProfileResponse(profile);
    }
}
