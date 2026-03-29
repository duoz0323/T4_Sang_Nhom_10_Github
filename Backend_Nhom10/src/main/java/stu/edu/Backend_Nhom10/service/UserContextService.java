package stu.edu.Backend_Nhom10.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import stu.edu.Backend_Nhom10.configuration.CurrentUser;
import stu.edu.Backend_Nhom10.entity.CandidateProfile;
import stu.edu.Backend_Nhom10.entity.CompanyProfile;
import stu.edu.Backend_Nhom10.enums.ReceiverType;
import stu.edu.Backend_Nhom10.exception.AppException;
import stu.edu.Backend_Nhom10.exception.ErrorCode;
import stu.edu.Backend_Nhom10.repository.CandidateProfileRepository;
import stu.edu.Backend_Nhom10.repository.CompanyProfileRepository;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserContextService {
    CandidateProfileRepository candidateRepository;
    CompanyProfileRepository companyRepository;

    public CurrentUser getCurrentUser() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        String keycloakId = jwt.getSubject();

        return candidateRepository.findByUserId(keycloakId)
                .map(c -> new CurrentUser(c.getCandidateProfileId(), ReceiverType.CANDIDATE))
                .orElseGet(() -> {
                    CompanyProfile company = companyRepository
                            .findByUserId(keycloakId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    return new CurrentUser(company.getCompanyProfileId(), ReceiverType.COMPANY);
                });
    }
}
