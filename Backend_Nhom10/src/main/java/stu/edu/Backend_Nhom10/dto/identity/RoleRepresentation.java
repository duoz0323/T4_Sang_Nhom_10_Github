package stu.edu.Backend_Nhom10.dto.identity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRepresentation {
    String id;
    String name;
    String description;
    Boolean composite;
    Boolean clientRole;
    String containerId;
}
