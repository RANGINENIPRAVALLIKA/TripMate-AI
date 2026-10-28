package com.tripmateai.dto.response.chat;
import java.time.LocalDateTime;
public record ChatMessageResponse(Long id, Long tripId, String message, String response, String model, LocalDateTime createdAt) { }
