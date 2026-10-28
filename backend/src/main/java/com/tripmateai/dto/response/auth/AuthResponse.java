package com.tripmateai.dto.response.auth; import com.tripmateai.dto.response.user.UserProfileResponse; public record AuthResponse(UserProfileResponse user,JwtResponse tokens) {}
