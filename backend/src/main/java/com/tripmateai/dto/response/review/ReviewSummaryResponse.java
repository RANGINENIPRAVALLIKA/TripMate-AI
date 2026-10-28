package com.tripmateai.dto.response.review;

import com.tripmateai.enums.ReviewType;
import java.math.BigDecimal;

public record ReviewSummaryResponse(ReviewType targetType, Long targetId,
                                    BigDecimal averageRating, long totalReviews) { }
