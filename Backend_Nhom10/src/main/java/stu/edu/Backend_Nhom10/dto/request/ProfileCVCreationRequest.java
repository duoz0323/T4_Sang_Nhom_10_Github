package stu.edu.Backend_Nhom10.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCVCreationRequest {
    String name;
    String phone;
    String email;
    String candidateProfileId;
    Long industryId;
    List<Long> skillIds;
}
