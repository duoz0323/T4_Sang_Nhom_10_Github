package stu.edu.Backend_Nhom10.controller;

import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.IndustryCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.IndustryResponse;
import stu.edu.Backend_Nhom10.service.IndustryService;

import java.util.List;

@RestController
@RequestMapping("/industries")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class IndustryController {
    IndustryService industryService;
    @PostMapping
    ApiResponse<IndustryResponse> createIndustry(@RequestBody IndustryCreateRequest request){
        return ApiResponse.<IndustryResponse>builder()
                .result(industryService.createIndustry(request))
                .build();
    }
    @PutMapping("/{id}")
    ApiResponse<IndustryResponse> updateIndustry(@RequestBody IndustryCreateRequest request,@PathVariable Long id){
        return ApiResponse.<IndustryResponse>builder()
                .result(industryService.updateIndustry(id,request))
                .build();
    }
    @GetMapping
    ApiResponse<List<IndustryResponse>> getAllIndustry(){
        return ApiResponse.<List<IndustryResponse>>builder()
                .result(industryService.getAll())
                .build();
    }
    @GetMapping("/{id}")
    ApiResponse<IndustryResponse> getByIndustryById(@PathVariable Long id){
        return ApiResponse.<IndustryResponse>builder()
                .result(industryService.getById(id))
                .build();
    }
//    @GetMapping("/search")
//    ApiResponse<List<IndustryResponse>> search(@RequestParam String keyword){
//        return ApiResponse.<List<IndustryResponse>>builder()
//                .result(IndustryService.search(keyword))
//                .build();
//    }
    @DeleteMapping("/{id}")
    ApiResponse<String> deleteIndustry(@PathVariable Long id){
        industryService.delete(id);
        return ApiResponse.<String>builder()
                .result("Delete success")
                .build();
    }
}
