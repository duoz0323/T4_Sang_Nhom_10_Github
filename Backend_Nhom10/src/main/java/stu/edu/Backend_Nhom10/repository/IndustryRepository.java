package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.Industry;
import stu.edu.Backend_Nhom10.entity.Skill;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndustryRepository extends JpaRepository<Industry,Long> {
    Optional<Industry> findByNameIndustry(String industry);

    List<Industry> findByNameIndustryIn(List<String> industryNames);
}
