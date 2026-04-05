package stu.edu.Backend_Nhom10.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.JobApplicationRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.service.JobApplicationService;

import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobApplicationController {
    JobApplicationService jobApplicationService;
    @PostMapping(value = "/public", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JobApplicationResponse> applyPublic(@RequestPart("data") JobApplicationRequest request, @RequestPart("file") MultipartFile file) {
        // Không kiểm tra đăng nhập, cho phép ai cũng gọi
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.apply(request, file))
                .build();
    }
    @PatchMapping("/{id}/withdraw")
    public ApiResponse<JobApplicationResponse> withdraw(@PathVariable String id) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.withdrawApplication(id))
                .build();
    }
    @GetMapping("/job/{jobId}")
    public ApiResponse<List<JobApplicationResponse>>getByJob(@PathVariable String jobId) {
        return ApiResponse.<List<JobApplicationResponse>>builder()
                .result(jobApplicationService.getApplicationsByJob(jobId))
                .build();
    }
    @PatchMapping("/{id}/accept")
    public ApiResponse<JobApplicationResponse> updateStatusAccept(@PathVariable String id) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.updateApplicationStatus(id,Status.ACCEPTED))
                .build();
    }
    @PatchMapping("/{id}/reject")
    public ApiResponse<JobApplicationResponse> updateStatusReject(@PathVariable String id) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.updateApplicationStatus(id,Status.REJECTED))
                .build();
    }
    @GetMapping("/me")
    public ApiResponse<List<JobApplicationResponse>> getMyApplications() {
        return ApiResponse.<List<JobApplicationResponse>>builder()
                .result(jobApplicationService.getMyApplications())
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<JobApplicationResponse> getApplicationById(@PathVariable String id) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.getApplicationById(id))
                .build();
    }
    @GetMapping("/quick-apply/preview")
    public ApiResponse<Object> getDefaultProfileCVPreview() {
        return ApiResponse.builder()
                .result(jobApplicationService.getDefaultProfileCV())
                .build();
    }

    @PostMapping("/{jobPostingId}/quick-apply")
    public ApiResponse<JobApplicationResponse> quickApply(
            @PathVariable String jobPostingId,
            @RequestBody(required = false) JobApplicationRequest request) {
        // Nếu request null, tạo request trống để sử dụng thông tin từ ProfileCV mặc định
        if (request == null) {
            request = new JobApplicationRequest();
        }
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.apply_quick(request, jobPostingId))
                .build();
    }

}
