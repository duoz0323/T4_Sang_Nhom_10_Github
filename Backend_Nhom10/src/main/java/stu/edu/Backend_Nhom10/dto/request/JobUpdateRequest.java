package stu.edu.Backend_Nhom10.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.dto.request.common.HasIndustryRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobUpdateRequest implements HasIndustryRequest {
    @NotBlank
    String title;
    String description;
    @Positive(message = "NUMBER_MUST_BE_POSITIVE")
    BigDecimal salaryRequire;
    List<Long> locations;
    LocalDate deadline;
    @NotEmpty(message = "NOT_BLANK")
    List<IndustryJobRequest>industries;
}
