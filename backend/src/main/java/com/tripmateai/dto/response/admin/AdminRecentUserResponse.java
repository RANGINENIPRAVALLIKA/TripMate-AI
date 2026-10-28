package com.tripmateai.dto.response.admin;
import java.time.LocalDateTime;
public record AdminRecentUserResponse(Long id, String fullName, String email, LocalDateTime registeredAt) { }
