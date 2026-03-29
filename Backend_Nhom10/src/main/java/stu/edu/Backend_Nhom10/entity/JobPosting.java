package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import stu.edu.Backend_Nhom10.enums.Status;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String jobPostingId;

    //Quan hệ 1-N với CompanyProfile
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_profile_id")
    CompanyProfile companyProfile;
    String title;
    String description;
    BigDecimal salaryRequire;

    @ManyToMany
    @JoinTable(
            name = "job_locations",
            joinColumns = @JoinColumn(name = "job_posting_id"),
            inverseJoinColumns = @JoinColumn(name = "location_id"),
            uniqueConstraints = @UniqueConstraint(columnNames = {"job_posting_id", "location_id"})
    )
    Set<Location> locations = new LinkedHashSet<>();

    @OneToMany(mappedBy = "jobPosting", cascade = CascadeType.ALL,orphanRemoval = true)
    Set<JobIndustry> industries = new LinkedHashSet<>();

    LocalDate deadline;
    @Enumerated(EnumType.STRING)
    Status status;
}
