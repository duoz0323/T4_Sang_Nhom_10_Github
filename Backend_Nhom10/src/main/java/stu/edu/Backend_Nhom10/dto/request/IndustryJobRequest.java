package stu.edu.Backend_Nhom10.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
//class request này phục vụ cho việc thêm lĩnh vực vào form tin tuyển dụng
public class IndustryJobRequest {
    @NotNull(message = "NOT_BLANK")
    String nameIndustry;
    @NotNull(message = "NOT_BLANK")
    List<Long> skillIds;
}
