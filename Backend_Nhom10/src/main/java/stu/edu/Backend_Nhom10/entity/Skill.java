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
public class Skill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long skillId;
    @Column(nullable = false,unique = true) // không được phép null, và giá trị là duy nhất
    String skillName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id")
    Industry industry;

    @ManyToMany(mappedBy = "skills")
    Set<JobPosting> jobPostings = new HashSet<>();
    @ManyToMany(mappedBy = "skills")
    Set<ProfileCV> profileCVList = new HashSet<>();
}
