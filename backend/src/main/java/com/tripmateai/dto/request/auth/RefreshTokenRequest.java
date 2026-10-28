package com.tripmateai.dto.request.auth; import jakarta.validation.constraints.*; public record RefreshTokenRequest(@NotBlank String refreshToken) {}
