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
public class Industry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long industryId;
    @Column(nullable = false, unique = true)
    String nameIndustry;

    @OneToMany(mappedBy = "industry",fetch = FetchType.LAZY)
    Set<Skill> skills = new HashSet<>();
}
