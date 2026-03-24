package stu.edu.Backend_Nhom10.dto.identity;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;
//UserCreationParam: Cấu trúc JSON chuẩn để tạo user trên Keycloak.
//khác RegistrationRequest vì Keycloak có các quy định riêng (ví dụ: enabled, emailVerified).
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationParam {
    String username;
    boolean enabled;
    String email;
    boolean emailVerified;
    String firstName;
    String lastName;
    List<Credential> credentials;
}
