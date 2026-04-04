package stu.edu.Backend_Nhom10.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobApplicationUpdateRequest {
    String name;
    String email;
    String phone;
}
