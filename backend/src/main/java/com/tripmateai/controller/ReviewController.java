package com.tripmateai.controller;

import com.tripmateai.dto.request.review.*;
import com.tripmateai.dto.response.ApiResponse;
import com.tripmateai.dto.response.review.*;
import com.tripmateai.enums.ReviewType;
import com.tripmateai.service.ReviewService;
import com.tripmateai.util.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(@Valid @RequestBody CreateReviewRequest request) {
        return ResponseUtils.created(service.create(request), "Review created");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> list(@RequestParam ReviewType targetType, @RequestParam Long targetId) {
        return ResponseUtils.success(service.list(targetType, targetId), "Reviews retrieved");
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ReviewSummaryResponse>> summary(@RequestParam ReviewType targetType, @RequestParam Long targetId) {
        return ResponseUtils.success(service.summary(targetType, targetId), "Rating summary retrieved");
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> get(@PathVariable Long reviewId) {
        return ResponseUtils.success(service.get(reviewId), "Review retrieved");
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(@PathVariable Long reviewId, @Valid @RequestBody UpdateReviewRequest request) {
        return ResponseUtils.success(service.update(reviewId, request), "Review updated");
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long reviewId) {
        service.delete(reviewId);
        return ResponseUtils.success(null, "Review deleted");
    }
}
