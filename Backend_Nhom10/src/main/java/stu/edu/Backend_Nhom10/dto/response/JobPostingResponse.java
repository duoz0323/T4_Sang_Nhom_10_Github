package stu.edu.Backend_Nhom10.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.entity.Location;

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
    String companyProfileId;
    String title;
    String description;
    BigDecimal salaryRequire;
    List<Location> locations;
    List<IndustryJobPostingResponse> industries;
    LocalDate deadline;
    String status;
}
