package stu.edu.Backend_Nhom10.service;

import feign.FeignException;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.request.LoginRequest;
import stu.edu.Backend_Nhom10.dto.request.RefreshTokenRequest;
import stu.edu.Backend_Nhom10.exception.ErrorNormalizer;
import stu.edu.Backend_Nhom10.repository.IdentityClient;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthService {
    IdentityClient identityClient;
    ErrorNormalizer errorNormalizer;

    @Value("${idp.client-id}")
    @NonFinal
    String clientId;

    @Value("${idp.client-secret}")
    @NonFinal
    String clientSecret;
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
    public TokenExchangeResponse refreshToken(@Valid RefreshTokenRequest request) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("grant_type", "refresh_token");
            params.put("client_id", clientId);
            params.put("client_secret", clientSecret);
            params.put("refresh_token",request.getRefreshToken());
            params.put("scope", "openid offline_access");

            return identityClient.exchangeToken(params);
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }

    public void logout(@Valid RefreshTokenRequest request) {
        try {
            Map<String, String> params = new HashMap<>();
            params.put("grant_type", "logout");
            params.put("client_id", clientId);
            params.put("client_secret", clientSecret);
            params.put("refresh_token",request.getRefreshToken());
            params.put("scope", "openid offline_access");

            identityClient.logout(params);
        } catch (FeignException exception) {
            throw errorNormalizer.handleKeyCloakException(exception);
        }
    }
}
