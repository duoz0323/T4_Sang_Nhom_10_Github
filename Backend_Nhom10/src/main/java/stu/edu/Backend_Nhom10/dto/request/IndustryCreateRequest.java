package stu.edu.Backend_Nhom10.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IndustryCreateRequest {
    @NotBlank(message = "NOT_BLANK")
    @Size(max = 50, message = "NAME_TOO_LONG")
    String nameIndustry;

}
