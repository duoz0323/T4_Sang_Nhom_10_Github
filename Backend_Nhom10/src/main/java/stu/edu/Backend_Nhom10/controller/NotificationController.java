package stu.edu.Backend_Nhom10.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.NotificationCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.NotificationResponse;
import stu.edu.Backend_Nhom10.service.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class NotificationController {
    NotificationService noticeService;
    @PostMapping
    ApiResponse<NotificationResponse> create(@RequestBody @Valid NotificationCreateRequest request) {

        return ApiResponse.<NotificationResponse>builder()
                .result(noticeService.create(request))
                .build();
    }

    private Long getUserId() {
        return 1L;
    }
    @GetMapping
    public List<NotificationResponse> getNotifications(@RequestParam(required = false) Long lastId) {
        return noticeService.getNotifications(getUserId (), lastId);
    }

    @GetMapping("/unread-count")
    public long countUnread() {
        return noticeService.countUnread(getUserId());
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        noticeService.markAsRead(id, getUserId());
    }

    @PatchMapping("/{id}/unread")
    public void markAsUnread(@PathVariable Long id) {
        noticeService.markAsUnread(id, getUserId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id, getUserId());
    }
}
