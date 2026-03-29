package stu.edu.Backend_Nhom10.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IndustryJobPostingResponse {
    Long industryId;
    String nameIndustry;
    List<SkillJobPostingResponse> skills;
}
