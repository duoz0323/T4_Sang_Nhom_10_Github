# HƯỚNG DẪN SỬA BACKEND ĐỂ FRONTEND GỌI API

## ❌ VẤN ĐỀ HIỆN TẠI
Backend đang yêu cầu authentication cho **TẤT CẢ** endpoints, kể cả những endpoint public như:
- `/posts/public` - Danh sách công việc công khai
- `/skills` - Danh sách kỹ năng
- `/locations` - Danh sách địa điểm
- `/industries` - Danh sách ngành nghề

Kết quả: Frontend không thể lấy dữ liệu → phải dùng mock data

## ✅ GIẢI PHÁP: Sửa SecurityConfig.java

**File cần sửa:** 
```
Backend_Nhom10/src/main/java/stu/edu/Backend_Nhom10/configuration/SecurityConfig.java
```

**Thay đổi:**

### Bước 1: Thêm danh sách PUBLIC_GET_ENDPOINTS

Thêm sau dòng 24 (sau PUBLIC_POST_ENDPOINTS):

```java
private final String[] PUBLIC_POST_ENDPOINTS = {
        "/company_profile/register",
        "/company_profile/login",
        "/candidate_profile/register",
        "/candidate_profile/login",
};

// THÊM ĐOẠN NÀY:
private final String[] PUBLIC_GET_ENDPOINTS = {
        "/posts/public",
        "/posts/*",
        "/locations",
        "/locations/**",
        "/skills",
        "/skills/**",
        "/industries",
        "/industries/**",
};
```

### Bước 2: Cập nhật filterChain method

Thay dòng 28-36 bằng:

```java
httpSecurity.authorizeHttpRequests(request -> request
        .requestMatchers(
                "/swagger-ui/**",
                "/v3/api-docs/**",
                "/swagger-ui.html"
        ).permitAll()
        .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()  // THÊM DÒNG NÀY
        .requestMatchers("/").permitAll()
        .anyRequest().authenticated());
```

## 📝 CODE HOÀN CHỈNH SAU KHI SỬA

```java
package stu.edu.Backend_Nhom10.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_POST_ENDPOINTS = {
            "/company_profile/register",
            "/company_profile/login",
            "/candidate_profile/register",
            "/candidate_profile/login",
    };

    private final String[] PUBLIC_GET_ENDPOINTS = {
            "/posts/public",
            "/posts/*",
            "/locations",
            "/locations/**",
            "/skills",
            "/skills/**",
            "/industries",
            "/industries/**",
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(request -> request
                .requestMatchers(
                        "/swagger-ui/**",
                        "/v3/api-docs/**",
                        "/swagger-ui.html"
                ).permitAll()
                .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
                .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
                .requestMatchers("/").permitAll()
                .anyRequest().authenticated());

        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2.jwt(
                jwtConfigurer -> jwtConfigurer.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));
        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        httpSecurity.cors(Customizer.withDefaults());

        return httpSecurity.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter(){
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(new CustomAuthoritiesConverter());

        return jwtAuthenticationConverter;
    }
}
```

## 🧪 TEST SAU KHI SỬA

Sau khi sửa và deploy lại BE, test bằng curl:

```bash
# Test skills endpoint
curl https://t4-sang-nhom-10-backend.onrender.com/skills

# Test locations endpoint  
curl https://t4-sang-nhom-10-backend.onrender.com/locations

# Test jobs endpoint
curl https://t4-sang-nhom-10-backend.onrender.com/posts/public
```

Kết quả mong đợi: Trả về data thay vì `{"code": 1006, "message": "Unauthenticated"}`

## 📌 LƯU Ý

- Sau khi sửa phải **BUILD và DEPLOY lại backend**
- Frontend đã được code sẵn để tự động chuyển từ mock data sang real data khi API hoạt động
- Nếu không muốn sửa BE → Frontend sẽ tiếp tục dùng mock data (đã implement xong)
