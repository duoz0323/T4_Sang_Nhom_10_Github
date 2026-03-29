package stu.edu.Backend_Nhom10.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class JobIndustry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne
    @JoinColumn(name = "job_posting_id")
    JobPosting jobPosting;

    @ManyToOne
    @JoinColumn(name = "industry_id")
    Industry industry;

    @OneToMany(mappedBy = "jobIndustry", cascade = CascadeType.ALL, orphanRemoval = true)
    Set<JobSkill> jobSkills = new HashSet<>();
}
