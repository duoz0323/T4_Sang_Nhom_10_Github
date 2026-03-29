package stu.edu.Backend_Nhom10.configuration;

import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.ReceiverType;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CurrentUser {
    private String id;
    private ReceiverType type;
}
