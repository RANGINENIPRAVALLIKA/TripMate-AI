package com.tripmateai.dto.request.review;

import com.tripmateai.enums.ReviewType;
import jakarta.validation.constraints.*;

public record CreateReviewRequest(
        @NotNull ReviewType targetType,
        @NotNull @Positive Long targetId,
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 5000) String comment) { }
