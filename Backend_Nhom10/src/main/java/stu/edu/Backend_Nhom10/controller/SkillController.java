package stu.edu.Backend_Nhom10.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.SkillRequest;
import stu.edu.Backend_Nhom10.dto.response.SkillResponse;
import stu.edu.Backend_Nhom10.service.SkillService;

import java.util.List;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SkillController {
    SkillService skillService;
    @PostMapping
    ApiResponse<SkillResponse> createSkill(@RequestBody SkillRequest request){
        return ApiResponse.<SkillResponse>builder()
                .result(skillService.createSkill(request))
                .build();
    }
    @PutMapping("/{id}")
    ApiResponse<SkillResponse> updateSkill(@RequestBody SkillRequest request,@PathVariable Long id){
        return ApiResponse.<SkillResponse>builder()
                .result(skillService.updateSkill(id,request))
                .build();
    }
    @GetMapping
    ApiResponse<List<SkillResponse>> getAllSkill(){
        return ApiResponse.<List<SkillResponse>>builder()
                .result(skillService.getAll())
                .build();
    }
    @GetMapping("/{id}")
    ApiResponse<SkillResponse> getBySkillById(@PathVariable Long id){
        return ApiResponse.<SkillResponse>builder()
                .result(skillService.getById(id))
                .build();
    }
    @GetMapping("/search")
    ApiResponse<List<SkillResponse>> search(@RequestParam String keyword){
        return ApiResponse.<List<SkillResponse>>builder()
                .result(skillService.search(keyword))
                .build();
    }
    @DeleteMapping("/{id}")
    ApiResponse<String> deleteSkill(@PathVariable Long id){
        skillService.delete(id);
        return ApiResponse.<String>builder()
                .result("Delete success")
                .build();
    }

}
