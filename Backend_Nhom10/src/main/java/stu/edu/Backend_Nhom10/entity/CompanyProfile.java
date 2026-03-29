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
public class CompanyProfile implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String companyProfileId;
    String phoneNumber;
    String companyName;
    String avatar;
    String address;
    Double desiredSalary;
    String tax;
    Boolean status;
    // UserId from keycloak
    @Column(unique = true)
    String userId;
    String email;

    @CreationTimestamp
    @Column(updatable = false)
    LocalDateTime createAt;
    @UpdateTimestamp
    LocalDateTime updateAt;

    //Quan hệ 1-N với JobPosting
    @OneToMany(mappedBy = "companyProfile",fetch = FetchType.LAZY)
    List<JobPosting> jobpostings;

}
