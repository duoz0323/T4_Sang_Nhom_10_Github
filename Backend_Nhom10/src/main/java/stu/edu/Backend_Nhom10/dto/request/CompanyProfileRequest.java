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
public class CompanyProfileRequest {
    String phoneNumber;
    String companyName;
    String avatar;
    String address;
    Double desiredSalary;
    String tax;
    Boolean status;
}
