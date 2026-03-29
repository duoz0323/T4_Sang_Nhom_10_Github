package stu.edu.Backend_Nhom10.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.LocationRequest;
import stu.edu.Backend_Nhom10.dto.response.LocationResponse;
import stu.edu.Backend_Nhom10.entity.Location;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.LocationMapper;
import stu.edu.Backend_Nhom10.repository.LocationRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class LocationService {
    LocationMapper locationMapper;
    LocationRepository locationRepository;

    public LocationResponse createLocation(LocationRequest request){
        String city = request.getCity().trim();
        // tránh duplicate
        var existing = locationRepository.findByCity(city);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.LOCATION_EXISTED);
        }
        Location location = locationMapper.toLocationEntity(request);
        return locationMapper.toLocationResponse(locationRepository.save(location));
    }
    public LocationResponse updateLocation(Long id,LocationRequest update){
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

        String newCity = update.getCity().trim();

        // check duplicate (trừ chính nó)
        var existing = locationRepository.findByCity(newCity);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.LOCATION_EXISTED);
        }

        location.setCity(newCity);
        return locationMapper.toLocationResponse(locationRepository.save(location));
    }
    public LocationResponse getById(Long id){
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

        return locationMapper.toLocationResponse(location);
    }
    public List<LocationResponse> getAll() {
        return locationRepository.findAll()
                .stream()
                .map(locationMapper::toLocationResponse)
                .toList();
    }
    public List<LocationResponse> search(String keyword) {
        return locationRepository
                .findByCityContainingIgnoreCase(keyword)
                .stream()
                .map(locationMapper::toLocationResponse)
                .toList();
    }
    public void delete(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.LOCATION_NOT_FOUND));

        // xử lý ManyToMany (tránh lỗi FK)
        if (!location.getJobs().isEmpty()) {
            throw new AppException(ErrorCode.LOCATION_IN_USE);
        }

        locationRepository.delete(location);
    }
}
