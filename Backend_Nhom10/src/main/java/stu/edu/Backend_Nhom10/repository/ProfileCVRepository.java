package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.entity.ProfileCV;

import java.util.Optional;

@Repository
public interface ProfileCVRepository extends JpaRepository<ProfileCV,String> {
    boolean existsByCandidateProfile_CandidateProfileId(String candidateProfileId);
}
