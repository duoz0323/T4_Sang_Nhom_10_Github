package stu.edu.Backend_Nhom10.controller;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.PostCreateRequest;
import stu.edu.Backend_Nhom10.dto.request.PostUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobPostingResponse;
import stu.edu.Backend_Nhom10.enums.Status;
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
    ApiResponse<JobPostingResponse> createPost(@RequestBody @Valid PostCreateRequest request){
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.createPost(request))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<JobPostingResponse> updatePost(
            @PathVariable String id,
            @RequestBody @Valid PostUpdateRequest request) {

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
    public ApiResponse<List<JobPostingResponse>> getMyPosts() {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getMyPosts())
                .build();
    }
    @GetMapping("/public")
    public ApiResponse<List<JobPostingResponse>> getAllActive(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) Long industryId,
            @RequestParam(required = false) Long minSalary,
            @RequestParam(required = false) Long maxSalary,
            @RequestParam(required = false) String workingFormat,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "20") Integer size) {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getAllActive(keyword, locationId, industryId, minSalary, maxSalary, workingFormat, page, size))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<JobPostingResponse> getPublicPost(@PathVariable String id) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.getPublicPost(id))
                .build();
    }
    @GetMapping("/admin/pending")
    public ApiResponse<List<JobPostingResponse>> getPendingPosts() {
        return ApiResponse.<List<JobPostingResponse>>builder()
                .result(jobPostingService.getPendingPosts())
                .build();
    }
    @PatchMapping("/admin/{id}/status")
    public ApiResponse<JobPostingResponse> updateStatus(
            @PathVariable String id,
            @RequestParam Status status
    ) {
        return ApiResponse.<JobPostingResponse>builder()
                .result(jobPostingService.updateStatus(id, status))
                .build();
    }
}
