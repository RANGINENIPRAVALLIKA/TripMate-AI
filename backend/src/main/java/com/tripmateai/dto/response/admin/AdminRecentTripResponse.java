package com.tripmateai.dto.response.admin;
import com.tripmateai.enums.TripStatus;
import java.time.*;
public record AdminRecentTripResponse(Long id, String tripName, String destination, TripStatus status, LocalDate startDate, LocalDateTime createdAt) { }
