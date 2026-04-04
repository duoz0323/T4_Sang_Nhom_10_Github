package stu.edu.Backend_Nhom10.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.ProfileCVCreationRequest;
import stu.edu.Backend_Nhom10.dto.response.ProfileCVResponse;
import stu.edu.Backend_Nhom10.entity.ProfileCV;
import stu.edu.Backend_Nhom10.service.ProfileCVService;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/profile-cv")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProfileCVController {
    ProfileCVService profileCVService;
    @PostMapping
    ApiResponse<ProfileCVResponse> createProfileCV(@RequestPart("data") ProfileCVCreationRequest request, @RequestPart("file") MultipartFile file) throws IOException {
        return ApiResponse.<ProfileCVResponse>builder()
                .result(profileCVService.createProfileCV(request,file))
                .build();
    }
    @PatchMapping("/{id}/is-default")
    ApiResponse<ProfileCVResponse> setIsDefault(@PathVariable String id){
        return ApiResponse.<ProfileCVResponse>builder()
                .result(profileCVService.setIsDefault(id))
                .build();
    }
    @PatchMapping("/{id}/un-default")
    ApiResponse<ProfileCVResponse> setUnDefault(@PathVariable String id){
        return ApiResponse.<ProfileCVResponse>builder()
                .result(profileCVService.setUnDefault(id))
                .build();
    }
    @DeleteMapping("/{id}")
    public void deleteProfileCV (@PathVariable String id) throws IOException {
        profileCVService.deleteProfileCV(id);
    }
    @GetMapping("/download/{cvId}")
    public ResponseEntity<Resource> downloadCV(@PathVariable String cvId) throws IOException {
        return profileCVService.downloadCV(cvId);
    }
    @GetMapping("/my-profileCV")
    public ApiResponse<List<ProfileCVResponse>> getAllMyProfile(){
        return ApiResponse.<List<ProfileCVResponse>>
                builder()
                .result(profileCVService.getAllMyProfile())
                .build();
    }
}
