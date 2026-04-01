package stu.edu.Backend_Nhom10.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobPostingResponse {
    String jobPostingId;
    CompanyProfileResponse companyProfile;
    String title;
    String description;
    BigDecimal salaryRequire;
    List<LocationResponse> locations;
    IndustryResponse industry;
    List<SkillResponse> skills;
    LocalDate deadline;
    Status status;
}
