package com.tripmateai.service;

import com.tripmateai.dto.request.review.*;
import com.tripmateai.dto.response.review.*;
import com.tripmateai.enums.ReviewType;
import java.util.List;

public interface ReviewService {
    ReviewResponse create(CreateReviewRequest request);
    List<ReviewResponse> list(ReviewType targetType, Long targetId);
    ReviewResponse get(Long reviewId);
    ReviewResponse update(Long reviewId, UpdateReviewRequest request);
    void delete(Long reviewId);
    ReviewSummaryResponse summary(ReviewType targetType, Long targetId);
}
