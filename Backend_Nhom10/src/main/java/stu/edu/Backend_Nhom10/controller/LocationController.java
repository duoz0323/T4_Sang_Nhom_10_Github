package stu.edu.Backend_Nhom10.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import stu.edu.Backend_Nhom10.dto.ApiResponse;
import stu.edu.Backend_Nhom10.dto.request.LocationRequest;
import stu.edu.Backend_Nhom10.dto.response.LocationResponse;
import stu.edu.Backend_Nhom10.service.LocationService;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationController {
    LocationService locationService;
    @PostMapping
    ApiResponse<LocationResponse> createLocation(@RequestBody LocationRequest request){
        return ApiResponse.<LocationResponse>builder()
                .result(locationService.createLocation(request))
                .build();
    }
    @PutMapping("/{id}")
    ApiResponse<LocationResponse> updateLocation(@RequestBody LocationRequest request,@PathVariable Long id){
        return ApiResponse.<LocationResponse>builder()
                .result(locationService.updateLocation(id,request))
                .build();
    }
    @GetMapping
    ApiResponse<List<LocationResponse>> getAllLocation(){
        return ApiResponse.<List<LocationResponse>>builder()
                .result(locationService.getAll())
                .build();
    }
    @GetMapping("/{id}")
    ApiResponse<LocationResponse> getByLocationById(@PathVariable Long id){
        return ApiResponse.<LocationResponse>builder()
                .result(locationService.getById(id))
                .build();
    }
    @GetMapping("/search")
    ApiResponse<List<LocationResponse>> search(@RequestParam String keyword){
        return ApiResponse.<List<LocationResponse>>builder()
                .result(locationService.search(keyword))
                .build();
    }
    @DeleteMapping("/{id}")
    ApiResponse<String> deleteLocation(@PathVariable Long id){
        locationService.delete(id);
        return ApiResponse.<String>builder()
                .result("Delete success")
                .build();
    }

}
