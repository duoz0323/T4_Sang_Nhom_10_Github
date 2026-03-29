package stu.edu.Backend_Nhom10.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    private Jwt getJwt() {
        Object principal = SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        if (principal instanceof Jwt jwt) {
            return jwt;
        }

        throw new RuntimeException("Invalid authentication principal");
    }

    public String getClaim(String key) {
        return getJwt().getClaim(key);
    }

    public String getCurrentCompanyId() {
        return getClaim("companyProfileId");
    }

    public String getUsername() {
        return getClaim("preferred_username");
    }
}
