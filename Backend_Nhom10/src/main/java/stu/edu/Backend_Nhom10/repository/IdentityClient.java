package stu.edu.Backend_Nhom10.repository;

import stu.edu.Backend_Nhom10.dto.identity.TokenExchangeResponse;
import stu.edu.Backend_Nhom10.dto.identity.UserCreationParam;
import stu.edu.Backend_Nhom10.dto.identity.RoleRepresentation;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@FeignClient(name = "identity-client", url = "${idp.url}")
public interface IdentityClient {

    @PostMapping(
            value = "/realms/${idp.realm}/protocol/openid-connect/token",
            consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    TokenExchangeResponse exchangeToken(@RequestBody Map<String, ?> param);


    @PostMapping(value = "/admin/realms/${idp.realm}/users", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> createUser(@RequestHeader("Authorization") String token, @RequestBody UserCreationParam param);

    @DeleteMapping(value = "/admin/realms/${idp.realm}/users/{userId}")
    ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String token, @PathVariable("userId") String userId);

    @PutMapping(value = "/admin/realms/${idp.realm}/users/{userId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> updateUser(@RequestHeader("Authorization") String token, @PathVariable("userId") String userId, @RequestBody UserCreationParam param);

    @GetMapping(value = "/admin/realms/${idp.realm}/roles/{roleName}")
    RoleRepresentation getRoleByName(@RequestHeader("Authorization") String token, @PathVariable("roleName") String roleName);

    @PostMapping(value ="/admin/realms/${idp.realm}/users/{userId}/role-mappings/realm", consumes = MediaType.APPLICATION_JSON_VALUE)
    ResponseEntity<?> assignRole(
            @RequestHeader("Authorization") String token,
            @PathVariable("userId") String userId,
            @RequestBody List<RoleRepresentation> roles
    );
}
