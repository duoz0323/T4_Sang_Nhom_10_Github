package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class ProfileCV {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String cvId;
    String email;
    String phone;
    String name;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    CandidateProfile candidateProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id", nullable = false)
    Industry industry;

    String cvPublicId;
    String fileName;
    String urlCVPreview;

    @ManyToMany
    @JoinTable(
            name = "cv_skills",
            joinColumns = @JoinColumn(name = "cv_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"cv_id", "skill_id"})
    )
    Set<Skill> skills = new HashSet<>();
    @Column(nullable = false)
    Boolean isDefault;
    @PrePersist
    public void prePersist() {
        if (isDefault == null) {
            isDefault = false;
        }
    }
}
