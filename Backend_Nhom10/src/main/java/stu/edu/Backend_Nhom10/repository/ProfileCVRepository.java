package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.ProfileCV;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileCVRepository extends JpaRepository<ProfileCV,String> {
    List<ProfileCV> findByCandidateProfile_UserId(String userId);
}
