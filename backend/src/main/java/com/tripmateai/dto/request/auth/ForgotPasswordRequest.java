package com.tripmateai.dto.request.auth; import jakarta.validation.constraints.*; public record ForgotPasswordRequest(@NotBlank @Email String email) {}
