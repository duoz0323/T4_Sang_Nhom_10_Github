package stu.edu.Backend_Nhom10.dto.response;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CompanyProfileResponse {
    String companyProfileId;
    String email;
    String companyName;
    String phoneNumber;
    String avatar;
    String address;
    Double desiredSalary;
    String tax;
    Boolean status;
}
