package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.Skill;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill,Long> {
    Optional<Skill> findBySkillName(String skill);
    List<Skill> findBySkillNameContainingIgnoreCase(String skill);

    // dùng để validate skill thuộc industry
    List<Skill> findBySkillIdIn(List<Long> ids);
}
