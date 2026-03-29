package stu.edu.Backend_Nhom10.repository;

import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.CompanyProfile;
import stu.edu.Backend_Nhom10.entity.JobPosting;
import stu.edu.Backend_Nhom10.enums.Status;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting,String> {
    // ================= STATUS =================
    List<JobPosting> findAllByStatus(Status status);
    List<JobPosting> findAllByStatusIn(List<Status> statuses);
    // ================= COMPANY =================
    List<JobPosting> findByCompanyProfile_CompanyProfileId(String companyId);
    List<JobPosting> findByCompanyProfile_CompanyProfileIdAndStatus(String companyId, Status status);
    List<JobPosting> findByCompanyProfile_CompanyProfileIdAndStatusIn(String companyId, List<Status> statuses);
    // ================= CANDIDATE VIEW =================
    List<JobPosting> findByStatusAndDeadlineAfter(Status status, LocalDate date);
    // ================= EXPIRED =================
    List<JobPosting> findByStatusAndDeadlineIsNotNullAndDeadlineLessThanEqual(
            Status status,
            LocalDate date
    );
    // ================= ADMIN =================
    // tất cả job chờ duyệt
    List<JobPosting> findByStatus(Status status);
    // filter nhiều status (admin dashboard)
    List<JobPosting> findByStatusIn(List<Status> statuses);

    // ================= CHECK =================
    boolean existsByJobPostingIdAndCompanyProfile(String id, CompanyProfile company);
    // ================= SEARCH (OPTIONAL NÂNG CAO) =================
    @Query("""
        SELECT j FROM JobPosting j
        WHERE LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
        AND j.status = 'APPROVED'
    """)
    List<JobPosting> searchByTitle(@Param("keyword") String keyword);


}
