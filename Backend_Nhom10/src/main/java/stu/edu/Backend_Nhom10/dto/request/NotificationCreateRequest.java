package stu.edu.Backend_Nhom10.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.NotificationType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreateRequest {
    @NotBlank
    private String title;
    private String content;
    @NotNull
    private NotificationType type;
    @NotNull
    private Long userId;
    private String link;
}
