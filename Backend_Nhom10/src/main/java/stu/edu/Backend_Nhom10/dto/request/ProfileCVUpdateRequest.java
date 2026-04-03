package stu.edu.Backend_Nhom10.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCVUpdateRequest {
    String name;
    Long industryId;
    List<Long> skillIds;
}
