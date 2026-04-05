package stu.edu.Backend_Nhom10.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.Status;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JobApplicationResponse {
    String id;
    JobPostingResponse jobPosting;
    CandidateProfileResponse candidateProfile;
    String email;
    String phone;
    String name;
    Status status;
    LocalDateTime appliedAt;
    String cvPublicId;
    String fileName;
    String urlCV;
}
