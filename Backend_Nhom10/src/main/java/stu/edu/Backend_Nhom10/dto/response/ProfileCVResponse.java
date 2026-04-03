package stu.edu.Backend_Nhom10.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.entity.Skill;
import stu.edu.Backend_Nhom10.enums.Status;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileCVResponse {
    String cvId;
    CandidateProfile candidateProfile;
    String name;
    String email;
    String phone;
    IndustryResponse industry;
    String fileName;
    String urlCVPreview;
    List<Skill> skills;
}
