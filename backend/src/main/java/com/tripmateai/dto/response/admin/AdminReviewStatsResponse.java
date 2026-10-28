package com.tripmateai.dto.response.admin;
import java.math.BigDecimal;
public record AdminReviewStatsResponse(long totalReviews, BigDecimal averageRating) { }
