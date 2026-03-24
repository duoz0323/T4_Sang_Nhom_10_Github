package stu.edu.Backend_Nhom10.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CandidateProfileResponse {
    String candidateProfileId;
    String email;
    String fullName;
    String phoneNumber;
    String avatar;
    String address;
    String description;
    LocalDate birthday;
    Boolean status;
}
