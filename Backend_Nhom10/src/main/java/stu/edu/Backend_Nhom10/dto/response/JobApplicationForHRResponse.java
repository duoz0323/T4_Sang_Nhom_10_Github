package stu.edu.Backend_Nhom10.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobApplicationForHRResponse {
    String id;

    // Candidate
    String candidateId;
    String name;
    String email;
    String phone;

    // CV
    String resumeUrl;
    String fileName;

    // Status
    String status;

    // Time
    LocalDateTime appliedAt;
}
