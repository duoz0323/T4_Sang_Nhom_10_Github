package stu.edu.Backend_Nhom10.dto.identity;

import lombok.*;
import lombok.experimental.FieldDefaults;
//TokenExchangeParam:
// Chứa thông tin để xin Access Token của Admin (gồm grant_type, client_id, client_secret)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenExchangeParam {
    String grant_type;
    String client_id;
    String client_secret;
    String scope;
}
