package com.tripmateai.dto.response.review;

import com.tripmateai.enums.ReviewType;
import java.time.LocalDateTime;

public record ReviewResponse(Long id, Long userId, String userName, ReviewType targetType,
                             Long targetId, String targetName, Integer rating, String comment,
                             LocalDateTime createdAt, LocalDateTime updatedAt) { }
