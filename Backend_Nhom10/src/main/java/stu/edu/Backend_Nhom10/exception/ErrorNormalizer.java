package stu.edu.Backend_Nhom10.exception;

import stu.edu.Backend_Nhom10.dto.identity.KeyCloakError;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
@Component
@Slf4j
public class ErrorNormalizer {
    private final ObjectMapper objectMapper;
    private final Map<String, ErrorCode> errorCodeMap;

    public ErrorNormalizer() {
        objectMapper = new ObjectMapper();
        errorCodeMap = new HashMap<>();

        errorCodeMap.put("User exists with same username", ErrorCode.USER_EXISTED);
        errorCodeMap.put("User exists with same email", ErrorCode.EMAIL_EXISTED);
        errorCodeMap.put("User name is missing", ErrorCode.USERNAME_IS_MISSING);
        // Map lỗi đăng nhập của Keycloak
        errorCodeMap.put("invalid_grant", ErrorCode.UNAUTHENTICATED); // Sai mật khẩu
    }

    public AppException handleKeyCloakException(FeignException exception) {
        try {
            log.warn("Cannot complete request", exception);
            String content = exception.contentUTF8();
            log.info("Keycloak Error Content: {}", content);
            
            // Xử lý trường hợp response body rỗng (No content to map)
            if (content == null || content.trim().isEmpty()) {
                 log.warn("Keycloak trả về response body rỗng");
                 return new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
            }
            
            var response = objectMapper.readValue(content, KeyCloakError.class);

            // Xử lý field 'errorMessage' (lỗi tạo user)
            if (Objects.nonNull(response.getErrorMessage())
                    && Objects.nonNull(errorCodeMap.get(response.getErrorMessage()))) {
                return new AppException(errorCodeMap.get(response.getErrorMessage()));
            }

            // Xử lý field 'error' (lỗi login)
            if (Objects.nonNull(response.getError())
                    && Objects.nonNull(errorCodeMap.get(response.getError()))) {
                return new AppException(errorCodeMap.get(response.getError()));
            }

        } catch (JsonProcessingException e) {
            log.error("Cannot deserialize content", e);
        } catch (Exception e) {
            log.error("Lỗi khi parse response từ Keycloak", e);
        }

        return new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
    }
}
