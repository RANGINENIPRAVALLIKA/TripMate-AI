package com.tripmateai.dto.response.chat;
import java.time.LocalDateTime;
public record ChatHistoryResponse(Long id, Long tripId, String message, String response, LocalDateTime createdAt) { }
