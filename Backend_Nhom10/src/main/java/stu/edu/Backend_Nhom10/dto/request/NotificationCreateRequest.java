package stu.edu.Backend_Nhom10.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.NotificationType;
import stu.edu.Backend_Nhom10.enums.ReceiverType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationCreateRequest {
    @NotBlank(message = "NOT_BLANK")
    private String title;
    private String content;
    @NotNull(message = "NOT_BLANK")
    private NotificationType type;
    @NotNull(message = "NOT_BLANK")
    String receiverId;
    @NotNull(message = "NOT_BLANK")
    ReceiverType receiverType;
    private String link;
}
