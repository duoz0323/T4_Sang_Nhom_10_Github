package stu.edu.Backend_Nhom10.mapper;

import org.mapstruct.Mapper;
import stu.edu.Backend_Nhom10.dto.request.NotificationCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.NotificationResponse;
import stu.edu.Backend_Nhom10.entity.Notification;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toNotificationEntity(NotificationCreateRequest request);
    NotificationResponse toNotificationResponse(Notification entity);
}
