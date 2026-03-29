package stu.edu.Backend_Nhom10.controller;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.configuration.CurrentUser;
import stu.edu.Backend_Nhom10.dto.response.NotificationResponse;
import stu.edu.Backend_Nhom10.service.NotificationService;
import stu.edu.Backend_Nhom10.service.UserContextService;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {
    NotificationService noticeService;
    UserContextService userContextService;

    @GetMapping
    List<NotificationResponse> getNotifications(@RequestParam(required = false) Long lastId) {
        CurrentUser currentUser = userContextService.getCurrentUser();
        return noticeService.getNotifications(
                currentUser.getId(),
                currentUser.getType(),
                lastId
        );

    }

    @GetMapping("/unread-count")
    long countUnread() {
        CurrentUser currentUser = userContextService.getCurrentUser();
        return noticeService.countUnread(currentUser.getId(),currentUser.getType());
    }
//
    @PatchMapping("/{id}/read")
    void markAsRead(@PathVariable Long id) {
        CurrentUser currentUser = userContextService.getCurrentUser();
        noticeService.markAsRead(id,currentUser.getId(),currentUser.getType());
    }
//
    @PatchMapping("/{id}/unread")
    void markAsUnread(@PathVariable Long id) {
        CurrentUser currentUser = userContextService.getCurrentUser();
        noticeService.markAsUnread(id,currentUser.getId(),currentUser.getType());
    }

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id) {
        CurrentUser currentUser = userContextService.getCurrentUser();
        noticeService.delete(id,currentUser.getId(),currentUser.getType());
    }
}
