package stu.edu.Backend_Nhom10.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.NotificationCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.NotificationResponse;
import stu.edu.Backend_Nhom10.entity.Notification;
import stu.edu.Backend_Nhom10.mapper.NotificationMapper;
import stu.edu.Backend_Nhom10.repository.NotificationRepository;
import stu.edu.Backend_Nhom10.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    NotificationMapper noticeMapper;
    NotificationRepository noticeRepository;
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification entity = noticeMapper.toNotificationEntity(request);
        entity.setIsRead(false);
        entity.setCreatedAt(LocalDateTime.now());

        return noticeMapper.toNotificationResponse(noticeRepository.save(entity));
    }

    public List<NotificationResponse> getNotifications(Long userId, Long lastId) {
        List<Notification> list;
        if (lastId == null) {
            list = noticeRepository.findTop20ByUser_UserIdOrderByIdDesc((userId));
        } else {
            list = noticeRepository.findByUser_UserIdAndIdLessThanOrderByIdDesc(
                    userId,
                    lastId,
                    PageRequest.of(0, 20)
            );
        }

        return list.stream()
                .map(noticeMapper::toNotificationResponse)
                .toList();
    }
    public long countUnread(Long userId) {
        return noticeRepository.countByUser_UserIdAndIsReadFalse(userId);
    }

    public void markAsRead(Long id, Long userId) {
        Notification n = noticeRepository.findById(id).orElseThrow();

        if (!n.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        n.setIsRead(true);
    }

    public void markAsUnread(Long id, Long userId) {
        Notification n = noticeRepository.findById(id)
                .orElseThrow();

        if (!n.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        n.setIsRead(false);
    }

    public void delete(Long id, Long userId) {
        Notification n = noticeRepository.findById(id).orElseThrow();

        if (!n.getUser().getUserId().equals(userId)) {
            throw new RuntimeException("Forbidden");
        }

        noticeRepository.delete(n);
    }
}
