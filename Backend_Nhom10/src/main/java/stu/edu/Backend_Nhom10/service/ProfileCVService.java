package stu.edu.Backend_Nhom10.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import stu.edu.Backend_Nhom10.dto.request.ProfileCVCreationRequest;
import stu.edu.Backend_Nhom10.dto.response.ProfileCVResponse;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.entity.Industry;
import stu.edu.Backend_Nhom10.entity.ProfileCV;
import stu.edu.Backend_Nhom10.entity.Skill;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.mapper.ProfileCVMapper;
import stu.edu.Backend_Nhom10.repository.CandidateProfileRepository;
import stu.edu.Backend_Nhom10.repository.IndustryRepository;
import stu.edu.Backend_Nhom10.repository.ProfileCVRepository;
import stu.edu.Backend_Nhom10.repository.SkillRepository;
import stu.edu.Backend_Nhom10.security.SecurityUtils;

import java.io.IOException;
import java.net.URL;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProfileCVService {
    ProfileCVMapper profileCVMapper;
    ProfileCVRepository profileCVRepository;
    CandidateProfileRepository candidateProfileRepository;
    SkillRepository skillRepository;
    Cloudinary cloudinary;
    IndustryRepository industryRepository;
    SecurityUtils securityUtils;

    public ProfileCVResponse createProfileCV(ProfileCVCreationRequest request, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_REQUIRED);
        }
        //Chỗ này để kiểm tra chỉ nhận file docx,pdf,word
        String contentType = file.getContentType();
        if (!List.of(
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ).contains(contentType)) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }
        String candidateProfileId = securityUtils.getObject();
        CandidateProfile candidate = candidateProfileRepository
                .findByUserId(candidateProfileId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        Industry industry = industryRepository.findById(request.getIndustryId())
                .orElseThrow(() -> new AppException(ErrorCode.INDUSTRY_NOT_FOUND));
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
        }
        // Tạo tên file: cv_userId_timestamp
        String filename = "cv_" + candidate.getCandidateProfileId() + "_" + System.currentTimeMillis() + extension;
        // Upload lên Cloudinary
        Map uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder","CVJob",
                        "resource_type", "raw", // cho file document
                        "public_id", filename,
                        "use_filename",true,
                        "unique_filename",false
                )
        );

        String publicId = uploadResult.get("public_id").toString();
        String cvUrl = uploadResult.get("secure_url").toString();
        ProfileCV profileCV = profileCVMapper.toEntity(request);
        //mapping skills
        Set<Skill> skills = new HashSet<>(skillRepository.findAllById(request.getSkillIds()));
        profileCV.setSkills(skills);

        String previewUrl;
        log.info(extension);
        if(extension.equals(".pdf")){
            log.info("this is file pdf");
            previewUrl= cvUrl;
        }
        else{
            previewUrl = "https://docs.google.com/gview?url="
                    + URLEncoder.encode(cvUrl, StandardCharsets.UTF_8)
                    + "&embedded=true";
        }
        profileCV.setUrlCVPreview(previewUrl);
        profileCV.setCandidateProfile(candidate);
        profileCV.setCvPublicId(publicId);
        profileCV.setFileName(filename);
        profileCV.setIndustry(industry);
        return profileCVMapper.toProfileCVResponse(profileCVRepository.save(profileCV));
    }
    public void deleteProfileCV(String profileCVId) throws IOException {
        String userId = securityUtils.getObject();
        ProfileCV profileCV = profileCVRepository.findById(profileCVId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        if (!profileCV.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (profileCV.getCvPublicId() != null) {
            cloudinary.uploader().destroy(
                    profileCV.getCvPublicId(),
                    Map.of("resource_type", "raw")
            );
        }
        profileCVRepository.delete(profileCV);
    }
    public ProfileCVResponse setIsDefault(String profileCVId){
        String userId = securityUtils.getObject();

        ProfileCV profileCV = profileCVRepository.findById(profileCVId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        if (!profileCV.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        profileCV.setIsDefault(true);
        return profileCVMapper.toProfileCVResponse(profileCVRepository.save(profileCV));
    }
    public ProfileCVResponse setUnDefault(String profileCVId){
        String userId = securityUtils.getObject();
        ProfileCV profileCV = profileCVRepository.findById(profileCVId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        if (!profileCV.getCandidateProfile().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        profileCV.setIsDefault(false);
        return profileCVMapper.toProfileCVResponse(profileCVRepository.save(profileCV));
    }
    public ResponseEntity<Resource> downloadCV(String cvId) throws IOException {
        ProfileCV profileCV = profileCVRepository.findById(cvId)
                .orElseThrow(() -> new AppException(ErrorCode.PROFILE_NOT_FOUND));
        String fileName = profileCV.getFileName();
        String extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        String fileUrl;
        if (extension.equals(".pdf")) {
            fileUrl = profileCV.getUrlCVPreview(); // URL gốc PDF
        } else {
            // Tách URL Cloudinary thật ra khỏi Google Docs viewer URL
            String previewUrl = profileCV.getUrlCVPreview();
            fileUrl = URLDecoder.decode(
                    previewUrl.replace("https://docs.google.com/gview?url=", "")
                            .replace("&embedded=true", ""),
                    StandardCharsets.UTF_8
            );
        }

        URL url = new URL(fileUrl);
        byte[] fileBytes = url.openStream().readAllBytes();

        MediaType mediaType = switch (extension) {
            case ".pdf" -> MediaType.APPLICATION_PDF;
            case ".doc" -> MediaType.parseMediaType("application/msword");
            case ".docx" -> MediaType.parseMediaType(
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\"")
                .contentType(mediaType)
                .body(new ByteArrayResource(fileBytes));
    }
    public List<ProfileCVResponse> getAllMyProfile(){
        String userId = securityUtils.getObject();
        return profileCVRepository.findByCandidateProfile_UserId(userId)
                .stream()
                .map(profileCVMapper::toProfileCVResponse)
                .toList();
    }
}
