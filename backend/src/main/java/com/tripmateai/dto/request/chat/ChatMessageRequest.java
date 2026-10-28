package com.tripmateai.dto.request.chat;
import jakarta.validation.constraints.*;
public record ChatMessageRequest(@NotBlank @Size(max=10000) String message, @Positive Long tripId) { }
