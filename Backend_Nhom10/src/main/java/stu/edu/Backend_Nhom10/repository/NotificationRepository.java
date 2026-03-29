package stu.edu.Backend_Nhom10.repository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import stu.edu.Backend_Nhom10.entity.Notification;
import stu.edu.Backend_Nhom10.enums.ReceiverType;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {
    // load lần đầu
    List<Notification> findTop20ByReceiverIdAndReceiverTypeOrderByIdDesc(String receiverId, ReceiverType receiverType);

    // load thêm
    List<Notification> findByReceiverIdAndReceiverTypeAndIdLessThanOrderByIdDesc(
            String receiverId,
            ReceiverType receiverType,
            Long lastId,
            Pageable pageable
    );

    // đếm unread
    long countByReceiverIdAndReceiverTypeAndIsReadFalse(String receiverId,ReceiverType receiverType);
}
