package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class CandidateProfile implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String candidateProfileId;
    String phoneNumber;
    String avatar;
    String address;
    String description;
    String fullName;
    LocalDate birthday;
    Boolean status;
    // UserId from keycloak
    @Column(unique = true)
    String userId;
    String email;

    @OneToMany(mappedBy = "candidateProfile",fetch = FetchType.LAZY)
    List<Notification> notifications;

    @OneToMany(mappedBy = "candidateProfile")
    List<JobApplication> jobApplications;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createAt;
    @UpdateTimestamp
    LocalDateTime updateAt;

}
