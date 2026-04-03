package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.JobApplication;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication,String> {
    List<JobApplication> findByCandidateProfile_UserId(String candidateId);

    List<JobApplication> findByJobPosting_jobPostingId(String jobId);

    boolean existsByCandidateProfile_CandidateProfileIdAndJobPosting_JobPostingId(String candidateProfileId, String jobPostingId);

}

