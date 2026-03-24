package stu.edu.Backend_Nhom10.repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.Notification;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {
    // load lần đầu
    List<Notification> findTop20ByUser_UserIdOrderByIdDesc(Long userId);

    // load thêm
    List<Notification> findByUser_UserIdAndIdLessThanOrderByIdDesc(
            Long userId,
            Long lastId,
            Pageable pageable
    );

    // đếm unread
    long countByUser_UserIdAndIsReadFalse(Long userId);
}
