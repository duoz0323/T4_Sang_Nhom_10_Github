package stu.edu.Backend_Nhom10.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.JobCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.JobUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.service.JobPostingService;

import java.util.List;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobPostingController {
    JobPostingService jobPostingService;
    @PostMapping
    ApiResponse<JobPostingResponse> createPost(@RequestBody @Valid JobCreateRequest request){
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.createPost(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<JobPostingResponse> updatePost(
            @PathVariable String id,
            @RequestBody @Valid JobUpdateRequest request) {

        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.updatePost(id, request))
                .build();
    }

    @PutMapping("/{id}/close")
    public ApiResponse<JobPostingResponse> closePost(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.closePost(id))
                .build();
    }
    @PutMapping("/{id}/reopen")
    public ApiResponse<JobPostingResponse> reopen(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.reopen(id))
                .build();
    }
    @GetMapping("/my-jobs")
    public ApiResponse<List<JobPostingResponse>> getMyJobs() {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getMyJobs())
                .build();
    }
    @GetMapping("/public")
    public ApiResponse<List<JobPostingResponse>> getAllActive() {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getAllActive())
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<JobPostingResponse> getPublicJob(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.getPublicJob(id))
                .build();
    }
    @GetMapping("/admin/pending")
    public ApiResponse<List<JobPostingResponse>> getPendingJobs() {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getPendingJobs())
                .build();
    }
    @PutMapping("/admin/{id}/approve")
    public ApiResponse<JobPostingResponse> approve(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.approve(id))
                .build();
    }
    @PutMapping("/admin/{id}/reject")
    public ApiResponse<JobPostingResponse> reject(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.reject(id))
                .build();
    }
}
