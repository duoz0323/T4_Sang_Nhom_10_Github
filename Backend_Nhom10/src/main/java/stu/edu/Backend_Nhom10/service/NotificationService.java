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
import stu.edu.Backend_Nhom10.enums.ReceiverType;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.NotificationMapper;
import stu.edu.Backend_Nhom10.repository.NotificationRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationService {
    NotificationMapper noticeMapper;
    NotificationRepository noticeRepository;
    public List<NotificationResponse> getNotifications(String receiverId, ReceiverType type,Long lastId) {
        List<Notification> list;
        if (lastId == null) {
            list = noticeRepository.findTop20ByReceiverIdAndReceiverTypeOrderByIdDesc(receiverId,type);
        } else {
            list = noticeRepository.findByReceiverIdAndReceiverTypeAndIdLessThanOrderByIdDesc(
                    receiverId,
                    type,
                    lastId,
                    PageRequest.of(0, 20)
            );
        }

        return list.stream()
                .map(noticeMapper::toNotificationResponse)
                .toList();
    }
    public long countUnread(String userId,ReceiverType receiverType) {
        return noticeRepository.countByReceiverIdAndReceiverTypeAndIsReadFalse(userId,receiverType);
    }

    public void markAsRead(Long id, String receiverId,ReceiverType type) {
        Notification n = noticeRepository.findById(id).orElseThrow();
        if (!n.getReceiverId().equals(receiverId)||n.getReceiverType() != type) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        n.setIsRead(true);
        noticeRepository.save(n);
    }

    public void markAsUnread(Long id, String receiverId,ReceiverType type) {
        Notification n = noticeRepository.findById(id)
                .orElseThrow();

        if (!n.getReceiverId().equals(receiverId)||n.getReceiverType() != type) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        n.setIsRead(false);
    }

    public void delete(Long id, String receiverId, ReceiverType type) {
        Notification n = noticeRepository.findById(id).orElseThrow();

        if (!n.getReceiverId().equals(receiverId)||n.getReceiverType() != type) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        noticeRepository.delete(n);
    }
}
