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
@Table(
        name = "job_application",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"candidate_profile_id", "job_posting_id"}
        )
)
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

    @Column(name = "cv_public_id")
    String cvPublicId;
    String fileName;
    String urlCV;
}
