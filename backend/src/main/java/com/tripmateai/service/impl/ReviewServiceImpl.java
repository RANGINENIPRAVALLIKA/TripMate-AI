package com.tripmateai.service.impl;

import com.tripmateai.dto.request.review.*;
import com.tripmateai.dto.response.review.*;
import com.tripmateai.entity.*;
import com.tripmateai.enums.ReviewType;
import com.tripmateai.exception.*;
import com.tripmateai.mapper.ReviewMapper;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviews;
    private final DestinationRepository destinations;
    private final HotelRepository hotels;
    private final RestaurantRepository restaurants;
    private final AttractionRepository attractions;

    @Override
    public ReviewResponse create(CreateReviewRequest request) {
        User user = currentUser();
        Review review = ReviewMapper.fromCreateRequest(request);
        review.setUser(user);
        review.setCreatedBy(user.getId());
        assignTarget(review, request.targetType(), request.targetId());
        return ReviewMapper.toResponse(reviews.save(review));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> list(ReviewType targetType, Long targetId) {
        requireTarget(targetType, targetId);
        return (switch (targetType) {
            case DESTINATION -> reviews.findByDestinationIdOrderByCreatedAtDesc(targetId);
            case HOTEL -> reviews.findByHotelIdOrderByCreatedAtDesc(targetId);
            case RESTAURANT -> reviews.findByRestaurantIdOrderByCreatedAtDesc(targetId);
            case ATTRACTION -> reviews.findByAttractionIdOrderByCreatedAtDesc(targetId);
        }).stream().map(ReviewMapper::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse get(Long reviewId) { return ReviewMapper.toResponse(find(reviewId)); }

    @Override
    public ReviewResponse update(Long reviewId, UpdateReviewRequest request) {
        Review review = ownReview(reviewId);
        ReviewMapper.apply(request, review);
        return ReviewMapper.toResponse(reviews.save(review));
    }

    @Override
    public void delete(Long reviewId) { reviews.delete(ownReview(reviewId)); }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse summary(ReviewType targetType, Long targetId) {
        requireTarget(targetType, targetId);
        ReviewRepository.RatingSummary summary = switch (targetType) {
            case DESTINATION -> reviews.destinationSummary(targetId);
            case HOTEL -> reviews.hotelSummary(targetId);
            case RESTAURANT -> reviews.restaurantSummary(targetId);
            case ATTRACTION -> reviews.attractionSummary(targetId);
        };
        BigDecimal average = summary.getAverageRating() == null ? BigDecimal.ZERO
                : BigDecimal.valueOf(summary.getAverageRating()).setScale(2, RoundingMode.HALF_UP);
        return new ReviewSummaryResponse(targetType, targetId, average, summary.getTotalReviews());
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) throw new UnauthorizedException("Authentication required");
        return userPrincipal.user();
    }

    private Review find(Long reviewId) {
        return reviews.findById(reviewId).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
    }

    private Review ownReview(Long reviewId) {
        Review review = find(reviewId);
        if (!Objects.equals(review.getUser().getId(), currentUser().getId())) {
            throw new UnauthorizedException("You can only modify your own reviews");
        }
        return review;
    }

    private void assignTarget(Review review, ReviewType type, Long targetId) {
        switch (type) {
            case DESTINATION -> review.setDestination(destinations.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Destination not found")));
            case HOTEL -> review.setHotel(hotels.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found")));
            case RESTAURANT -> review.setRestaurant(restaurants.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found")));
            case ATTRACTION -> review.setAttraction(attractions.findById(targetId)
                    .orElseThrow(() -> new ResourceNotFoundException("Attraction not found")));
        }
    }

    private void requireTarget(ReviewType type, Long targetId) {
        switch (type) {
            case DESTINATION -> destinations.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Destination not found"));
            case HOTEL -> hotels.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
            case RESTAURANT -> restaurants.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
            case ATTRACTION -> attractions.findById(targetId).orElseThrow(() -> new ResourceNotFoundException("Attraction not found"));
        }
    }
}
