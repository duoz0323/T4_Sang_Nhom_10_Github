package stu.edu.Backend_Nhom10.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Uncategorized error", HttpStatus.BAD_REQUEST),
    INVALID_USERNAME(1003, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(1004, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    EMAIL_EXISTED(1008, "Email existed, please choose another one", HttpStatus.BAD_REQUEST),
    USER_EXISTED(1009, "Username existed, please choose another one", HttpStatus.BAD_REQUEST),
    USERNAME_IS_MISSING(1010, "Please enter username", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1011, "User not existed", HttpStatus.BAD_REQUEST),
    PAGE_NOT_FOUND(1012, "Page not found", HttpStatus.NOT_FOUND),
    PROFILE_NOT_FOUND(1013, "profile not found", HttpStatus.NOT_FOUND),

    //Valid Code
    NOT_BLANK(1014,"Cannot be left blank",HttpStatus.BAD_REQUEST),
    NUMBER_MUST_BE_POSITIVE(1020,"Number must be none nagative",HttpStatus.BAD_REQUEST),
    NAME_TOO_LONG(1021,"Name Industry is too long",HttpStatus.BAD_REQUEST),

    //ERROR LOCATION
    LOCATION_NOT_FOUND(1015,"Location not found",HttpStatus.BAD_REQUEST),
    LOCATION_EXISTED(1016,"Location existed",HttpStatus.BAD_REQUEST),
    LOCATION_IN_USE(2001, "Location is being used",HttpStatus.BAD_REQUEST),

    //ERROR SKILL
    SKILL_NOT_FOUND(1017,"Skill not found",HttpStatus.BAD_REQUEST),
    SKILL_EXISTED(1018,"Skill existed",HttpStatus.BAD_REQUEST),
    SKILL_IN_USE(1019,"Skill is being used",HttpStatus.BAD_REQUEST),

    INDUSTRY_EXISTED(1022,"Industry existed",HttpStatus.BAD_REQUEST),
    INDUSTRY_NOT_FOUND(1023,"Industry not found",HttpStatus.BAD_REQUEST),
    INDUSTRY_IN_USE(1024,"Industry is have been skill" ,HttpStatus.BAD_REQUEST),

    //JOBPOSTING
    POST_NOT_EXISTED(1025,"Post is not existed",HttpStatus.BAD_REQUEST),
    INVALID_ADJUST_POST(1026,"Can not adjust this post",HttpStatus.BAD_REQUEST),
    POST_NOT_FOUND(1026,"post not found",HttpStatus.BAD_REQUEST),
    POST_NOT_ACTIVE(1027,"Job not available",HttpStatus.BAD_REQUEST),
    POST_EXPIRED(1028,"Job is expired",HttpStatus.BAD_REQUEST),
    SKILL_NOT_BELONG_TO_INDUSTRY(1029,"Skill not belong to industry",HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final HttpStatusCode statusCode;
    private final String message;
}
