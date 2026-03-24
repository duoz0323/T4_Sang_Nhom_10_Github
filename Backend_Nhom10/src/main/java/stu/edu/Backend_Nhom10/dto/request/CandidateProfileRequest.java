package stu.edu.Backend_Nhom10.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CandidateProfileRequest {
    String fullName;
    String phoneNumber;
    String avatar;
    String address;
    String description;
    Boolean status;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate birthday;
}
