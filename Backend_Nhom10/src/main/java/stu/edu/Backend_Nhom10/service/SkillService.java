package stu.edu.Backend_Nhom10.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.dto.request.SkillRequest;
import stu.edu.Backend_Nhom10.dto.response.SkillResponse;
import stu.edu.Backend_Nhom10.entity.Skill;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.SkillMapper;
import stu.edu.Backend_Nhom10.repository.SkillRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SkillService {
    SkillRepository skillRepository;
    SkillMapper skillMapper;

    public SkillResponse createSkill(SkillRequest request){
        String skillName = request.getSkillName().trim();
        // tránh duplicate
        var existing = skillRepository.findBySkillName(skillName);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.SKILL_EXISTED);
        }
        Skill skill = skillMapper.toSkillEntity(request);
        return skillMapper.toSkillResponse(skillRepository.save(skill));
    }
    public SkillResponse updateSkill(Long id,SkillRequest update){
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKILL_NOT_FOUND));

        String skillName = update.getSkillName().trim();
        // check duplicate (trừ chính nó)
        var existing = skillRepository.findBySkillName(skillName);
        if (existing.isPresent()) {
            throw new AppException(ErrorCode.SKILL_EXISTED);
        }

        skillMapper.updateSkill(skill,update);
        return skillMapper.toSkillResponse(skillRepository.save(skill));
    }
    public SkillResponse getById(Long id){
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKILL_NOT_FOUND));

        return skillMapper.toSkillResponse(skill);
    }
    public List<SkillResponse> getAll() {
        return skillRepository.findAll()
                .stream()
                .map(skillMapper::toSkillResponse)
                .toList();
    }
    public List<SkillResponse> search(String keyword) {
        return skillRepository
                .findBySkillNameContainingIgnoreCase(keyword)
                .stream()
                .map(skillMapper::toSkillResponse)
                .toList();
    }
    public void delete(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SKILL_NOT_FOUND));

        //xử lý ManyToMany (tránh lỗi FK)
        if (skill.getIndustry()!=null) {
            throw new AppException(ErrorCode.LOCATION_IN_USE);
        }

        skillRepository.delete(skill);
    }
}
