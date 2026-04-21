package stu.edu.Backend_Nhom10.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.JobPosting;
import stu.edu.Backend_Nhom10.enums.Status;

import java.math.BigDecimal;
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

    // ================= SEARCH =================
    @Query("""
    SELECT DISTINCT j
    FROM JobPosting j
    LEFT JOIN j.locations l
    WHERE j.status = stu.edu.Backend_Nhom10.enums.Status.ACTIVE
      AND (j.deadline IS NULL OR j.deadline >= :today)
      AND (:industryId IS NULL OR j.industry.industryId = :industryId)
      AND (:locationId IS NULL OR l.id = :locationId)
      AND (:minSalary IS NULL OR j.salaryRequire >= :minSalary)
      AND (:maxSalary IS NULL OR j.salaryRequire <= :maxSalary)
""")
    List<JobPosting> searchPublicPosts(
            @Param("industryId") Long industryId,
            @Param("locationId") Long locationId,
            @Param("minSalary") BigDecimal minSalary,
            @Param("maxSalary") BigDecimal maxSalary,
            @Param("today") LocalDate today
    );

}
