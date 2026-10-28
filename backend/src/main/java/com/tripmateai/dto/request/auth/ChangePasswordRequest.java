package com.tripmateai.dto.request.auth; import jakarta.validation.constraints.*; public record ChangePasswordRequest(@NotBlank String currentPassword,@NotBlank @Size(min=8) String newPassword) {}
