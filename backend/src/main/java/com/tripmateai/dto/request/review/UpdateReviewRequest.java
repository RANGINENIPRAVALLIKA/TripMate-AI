package com.tripmateai.dto.request.review;

import jakarta.validation.constraints.*;

public record UpdateReviewRequest(
        @NotNull @Min(1) @Max(5) Integer rating,
        @Size(max = 5000) String comment) { }
