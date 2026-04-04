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
import stu.edu.Backend_Nhom10.dto.request.JobApplicationUpdateRequest;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationForHRResponse;
import stu.edu.Backend_Nhom10.dto.response.JobApplicationResponse;
import stu.edu.Backend_Nhom10.enums.Status;
import stu.edu.Backend_Nhom10.service.JobApplicationService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class JobApplicationController {
    JobApplicationService jobApplicationService;
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<JobApplicationResponse> apply(@RequestPart("data") JobApplicationRequest request,@RequestPart("file") MultipartFile file) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.apply(request,file))
                .build();
    }
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) throws IOException {
        jobApplicationService.deleteApplication(id);
    }
    @PutMapping("/{id}")
    public ApiResponse<JobApplicationResponse> update(@PathVariable String id, @RequestPart("data") JobApplicationUpdateRequest request, @RequestPart("file") MultipartFile file) {
        return ApiResponse.<JobApplicationResponse>builder()
                .result(jobApplicationService.updateApplication(id,request,file))
                .build();
    }
    @GetMapping("/job/{jobId}")
    public ApiResponse<List<JobApplicationForHRResponse>>getByJob(@PathVariable String jobId) {
        return ApiResponse.<List<JobApplicationForHRResponse>>builder()
                .result(jobApplicationService.getApplicationsByJob(jobId))
                .build();
    }
    @PatchMapping("/{id}/accept")
    public ApiResponse<JobApplicationForHRResponse> updateStatusAccept(@PathVariable String id) {
        return ApiResponse.<JobApplicationForHRResponse>builder()
                .result(jobApplicationService.updateApplicationStatus(id,Status.ACCEPTED))
                .build();
    }
    @PatchMapping("/{id}/reject")
    public ApiResponse<JobApplicationForHRResponse> updateStatusReject(@PathVariable String id) {
        return ApiResponse.<JobApplicationForHRResponse>builder()
                .result(jobApplicationService.updateApplicationStatus(id,Status.REJECTED))
                .build();
    }
    @GetMapping("/me")
    public ApiResponse<List<JobApplicationResponse>> getMyApplications() {
        return ApiResponse.<List<JobApplicationResponse>>builder()
                .result(jobApplicationService.getMyApplications())
                .build();
    }


}
