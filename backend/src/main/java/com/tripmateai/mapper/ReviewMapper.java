package com.tripmateai.mapper;

import com.tripmateai.dto.request.review.*;
import com.tripmateai.dto.response.review.ReviewResponse;
import com.tripmateai.entity.Review;
import com.tripmateai.enums.ReviewType;

public final class ReviewMapper {
    private ReviewMapper() { }

    public static Review fromCreateRequest(CreateReviewRequest request) {
        Review review = new Review();
        review.setReviewType(request.targetType());
        review.setRating(request.rating());
        review.setComment(request.comment());
        return review;
    }

    public static void apply(UpdateReviewRequest request, Review review) {
        review.setRating(request.rating());
        review.setComment(request.comment());
    }

    public static ReviewResponse toResponse(Review review) {
        Target target = targetOf(review);
        return new ReviewResponse(review.getId(), review.getUser().getId(), review.getUser().getFullName(),
                review.getReviewType(), target.id(), target.name(), review.getRating(), review.getComment(),
                review.getCreatedAt(), review.getUpdatedAt());
    }

    private static Target targetOf(Review review) {
        if (review.getDestination() != null) return new Target(review.getDestination().getId(), review.getDestination().getCity());
        if (review.getHotel() != null) return new Target(review.getHotel().getId(), review.getHotel().getName());
        if (review.getRestaurant() != null) return new Target(review.getRestaurant().getId(), review.getRestaurant().getName());
        if (review.getAttraction() != null) return new Target(review.getAttraction().getId(), review.getAttraction().getName());
        throw new IllegalStateException("Review has no review target");
    }

    private record Target(Long id, String name) { }
}
