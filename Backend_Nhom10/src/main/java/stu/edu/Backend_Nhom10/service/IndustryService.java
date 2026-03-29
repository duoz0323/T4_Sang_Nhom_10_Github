package stu.edu.Backend_Nhom10.service;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.IndustryCreateRequest;
import stu.edu.Backend_Nhom10.dto.response.IndustryResponse;
import stu.edu.Backend_Nhom10.entity.Industry;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.IndustryMapper;
import stu.edu.Backend_Nhom10.repository.IndustryRepository;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class IndustryService {
    IndustryRepository IndustryRepository;
    IndustryMapper IndustryMapper;

    public IndustryResponse createIndustry(IndustryCreateRequest request){
        String industryName = request.getNameIndustry().trim();
        // tránh duplicate
        var existing = IndustryRepository.findByNameIndustry(industryName);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.INDUSTRY_EXISTED);
        }
        Industry industry = IndustryMapper.toIndustryEntity(request);
        return IndustryMapper.toIndustryResponse(IndustryRepository.save(industry));
    }
    public IndustryResponse updateIndustry(Long id,IndustryCreateRequest update){
        Industry industry = IndustryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INDUSTRY_NOT_FOUND));

        String industryName = update.getNameIndustry().trim();
        // check duplicate (trừ chính nó)
        var existing = IndustryRepository.findByNameIndustry(industryName);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.INDUSTRY_EXISTED);
        }

        industry.setNameIndustry(industryName);
        return IndustryMapper.toIndustryResponse(IndustryRepository.save(industry));
    }
    public IndustryResponse getById(Long id){
        Industry industry = IndustryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INDUSTRY_NOT_FOUND));

        return IndustryMapper.toIndustryResponse(industry);
    }
    public List<IndustryResponse> getAll() {
        return IndustryRepository.findAll()
                .stream()
                .map(IndustryMapper::toIndustryResponse)
                .toList();
    }
//    public List<IndustryResponse> search(String keyword) {
//        return IndustryRepository
//                .findByIndustryNameContainingIgnoreCase(keyword)
//                .stream()
//                .map(IndustryMapper::toIndustryResponse)
//                .toList();
//    }
    public void delete(Long id) {
        Industry industry = IndustryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.INDUSTRY_NOT_FOUND));

        //xử lý ManyToMany (tránh lỗi FK)
        if (!industry.getSkills().isEmpty()) {
            throw new AppException(ErrorCode.INDUSTRY_IN_USE);
        }

        IndustryRepository.delete(industry);
    }
}
