package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.Status;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_profile_id")
    CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id")
    JobPosting jobPosting;

    LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    Status status;

    String email;
    String phone;
    String name;

    String fileName;
    String urlCV;
}
