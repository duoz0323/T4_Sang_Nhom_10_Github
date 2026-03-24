package stu.edu.Backend_Nhom10.dto.identity;

import lombok.*;
import lombok.experimental.FieldDefaults;
//Credential:Keycloak lưu mật khẩu dưới dạng (type, value, temporary)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Credential {
    String type;
    String value;
    boolean temporary;
}
