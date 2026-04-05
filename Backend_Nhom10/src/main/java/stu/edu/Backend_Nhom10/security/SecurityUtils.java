package stu.edu.Backend_Nhom10.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private Jwt getJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt;
        }

        throw new IllegalStateException("Authentication principal is not a JWT");
    }

    public String getClaimAsString(String key) {
        Object value = getJwt().getClaims().get(key);
        return value != null ? value.toString() : null;
    }

    public String getCurrentCompanyId() {
        return getClaimAsString("companyProfileId");
    }

    public String getSubject() {
        return getJwt().getSubject();
    }

    public String getUsername() {
        return getClaimAsString("preferred_username");
    }
}
