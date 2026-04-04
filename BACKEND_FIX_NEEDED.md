# 🚨 CRITICAL ISSUE: Backend Security Configuration Error

## ❌ VẤN ĐỀ NGHIÊM TRỌNG

Backend **YÊU CẦU AUTHENTICATION** cho TẤT CẢ endpoints, kể cả những endpoint public!

### Test Results:
```bash
curl https://t4-sang-nhom-10-backend.onrender.com/posts/public
→ Response: { "code": 1006, "message": "Unauthenticated" }

curl https://t4-sang-nhom-10-backend.onrender.com/locations  
→ Response: { "code": 1006, "message": "Unauthenticated" }
```

**TẤT CẢ GET endpoints đều trả về 401 Unauthorized!**

---

## 🔍 NGUYÊN NHÂN

**File:** `Backend_Nhom10/src/main/java/stu/edu/Backend_Nhom10/configuration/SecurityConfig.java`

**Dòng 36:** Sử dụng biến `PUBLIC_GET_ENDPOINTS` nhưng **CHƯA ĐƯỢC KHAI BÁO**!

```java
private final String[] PUBLIC_POST_ENDPOINTS = {
    "/company_profile/register",
    "/company_profile/login",
    "/candidate_profile/register",
    "/candidate_profile/login",
};

// ❌ THIẾU KHAI BÁO:
// private final String[] PUBLIC_GET_ENDPOINTS = { ... };

@Bean
public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
    httpSecurity.authorizeHttpRequests(request -> request
        .requestMatchers(PUBLIC_POST_ENDPOINTS).permitAll()
        .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()  // ❌ Biến không tồn tại!
        .authenticated());  // ❌ Syntax error: thiếu .anyRequest()
```

**Kết quả:** Spring Security coi TẤT CẢ requests đều cần authentication!

---

## ✅ GIẢI PHÁP - YÊU CẦU BACKEND SỬA

### Option 1: Thêm PUBLIC_GET_ENDPOINTS (RECOMMENDED)

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

    // ✅ THÊM PUBLIC GET ENDPOINTS
    private final String[] PUBLIC_GET_ENDPOINTS = {
            "/posts/public",
            "/posts/{id}",
            "/locations",
            "/locations/**",
            "/skills",
            "/skills/**",
            "/industries",
            "/industries/**"
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
                .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()  // ✅ Giờ có biến rồi!
                .anyRequest().authenticated());  // ✅ Fixed syntax error

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

### Option 2: Bỏ dòng PUBLIC_GET_ENDPOINTS (TEMPORARY FIX)

Nếu muốn tất cả GET requests đều cần auth, bỏ dòng 36:

```java
httpSecurity.authorizeHttpRequests(request -> request
        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
        .requestMatchers(HttpMethod.POST, PUBLIC_POST_ENDPOINTS).permitAll()
        // ❌ XÓA DÒNG NÀY:
        // .requestMatchers(HttpMethod.GET, PUBLIC_GET_ENDPOINTS).permitAll()
        .anyRequest().authenticated());  // ✅ Fix syntax
```

**Nhưng như vậy Frontend sẽ KHÔNG THỂ hiển thị jobs nếu chưa login!**

---

## 🎯 IMPACT

### Hiện tại (Backend có lỗi):
- ❌ `/posts/public` → 401 Unauthorized
- ❌ `/locations` → 401 Unauthorized  
- ❌ `/skills` → 401 Unauthorized
- ❌ User PHẢI login mới xem được jobs
- ❌ Homepage không thể hiển thị jobs

### Sau khi sửa (Option 1):
- ✅ `/posts/public` → 200 OK, trả về jobs
- ✅ `/locations` → 200 OK, trả về locations
- ✅ `/skills` → 200 OK, trả về skills
- ✅ User KHÔNG CẦN login để xem jobs
- ✅ Homepage hiển thị jobs ngay

---

## 📝 TESTING AFTER FIX

Sau khi Backend sửa và redeploy, test lại:

```bash
# Test 1: Public jobs (không cần token)
curl https://t4-sang-nhom-10-backend.onrender.com/posts/public
# Expected: {"code": 1000, "result": [...jobs...]}

# Test 2: Locations
curl https://t4-sang-nhom-10-backend.onrender.com/locations
# Expected: {"code": 1000, "result": [...locations...]}

# Test 3: Skills
curl https://t4-sang-nhom-10-backend.onrender.com/skills
# Expected: {"code": 1000, "result": [...skills...]}
```

---

## 🔄 WORKAROUND (Nếu không sửa Backend)

Nếu Backend KHÔNG SỬA, Frontend phải:

### 1. Force user login trước khi xem jobs

```javascript
// HomePage.jsx
useEffect(() => {
  if (!isAuthenticated) {
    navigate('/login', { 
      state: { message: 'Vui lòng đăng nhập để xem việc làm' } 
    });
  }
}, [isAuthenticated]);
```

### 2. Tạo test account sẵn

Tạo 1 account "guest" có thể dùng cho mọi người:
```
Email: guest@jobmatch.com
Password: guest123
```

### 3. Auto-login with guest account

```javascript
// Auto login nếu chưa có token
if (!localStorage.getItem('accessToken')) {
  await authService.loginCandidate('guest@jobmatch.com', 'guest123');
}
```

**Nhưng đây KHÔNG PHẢI giải pháp tốt!**

---

## ⚠️ RECOMMENDATION

**YÊU CẦU BACKEND TEAM SỬA NGAY:**

1. Thêm `PUBLIC_GET_ENDPOINTS` array
2. Fix syntax error `.anyRequest().authenticated()`
3. Redeploy backend
4. Test lại với curl

**Thời gian sửa ước tính:** 5-10 phút  
**Thời gian redeploy:** ~5-10 phút (Render)

**KHÔNG SỬA = Frontend không thể hoạt động đúng!**

---

## 📞 NEXT STEPS

1. ✅ Gửi file này cho Backend team
2. ⏳ Đợi Backend sửa và redeploy
3. ✅ Test lại với curl
4. ✅ Frontend sẽ tự động hoạt động sau đó

**File cần sửa:** `SecurityConfig.java`  
**Số dòng code cần thêm:** ~10 dòng  
**Độ ưu tiên:** 🔴 CRITICAL - BLOCKING FRONTEND

---

Hiện tại **KHÔNG PHẢI LỖI FRONTEND** - đây là **LỖI BACKEND CONFIGURATION**!
