package stu.edu.Backend_Nhom10.dto.identity;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;
//TokenExchangeResponse: Hứng kết quả JSON từ Keycloak, trích xuất chuỗi access_token.
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class TokenExchangeResponse {
    String accessToken;
    String expiresIn;
    String refresh_token;
    String refreshExpiresIn;
    String tokenType;
    String idToken;
    String scope;

}
