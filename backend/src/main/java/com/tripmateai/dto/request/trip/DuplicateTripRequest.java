package com.tripmateai.dto.request.trip; import jakarta.validation.constraints.*; public record DuplicateTripRequest(@NotBlank @Size(max=200) String tripName) {}
