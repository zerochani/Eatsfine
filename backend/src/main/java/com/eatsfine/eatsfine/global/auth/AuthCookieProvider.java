package com.eatsfine.eatsfine.global.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieProvider {

    @Value("${app.oauth2.cookie.domain}")
    private String cookieDomain;

    public ResponseCookie refreshTokenCookie(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("refreshToken must not be blank");
        }

        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(cookieDomain)
                .path("/")
                .maxAge(Duration.ofDays(14))
                .build();
    }

    public ResponseCookie clearRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .domain(cookieDomain)
                .path("/")
                .maxAge(0) // 수명을 0으로 설정하여 즉시 삭제
                .build();
    }
}
