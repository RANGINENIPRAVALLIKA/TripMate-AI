package com.tripmateai.dto.response.admin;
import java.time.LocalDateTime;
public record AdminRecentActivityResponse(Long id, Long adminId, String action, String targetType, Long targetId, LocalDateTime createdAt) { }
