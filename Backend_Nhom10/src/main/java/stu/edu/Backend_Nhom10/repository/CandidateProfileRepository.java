package stu.edu.Backend_Nhom10.repository;

import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateProfileRepository extends JpaRepository<CandidateProfile, String> {
    Optional<CandidateProfile> findByUserId(String userId);
}
