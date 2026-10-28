package com.tripmateai.dto.response.analytics;
import com.tripmateai.enums.TripStatus;
import java.math.BigDecimal;
import java.util.*;
public record TripAnalyticsResponse(long totalTrips, long completedTrips, long upcomingTrips,
                                    BigDecimal totalBudget, Map<TripStatus, Long> statusDistribution,
                                    List<MonthlyTripAnalyticsResponse> monthlyTrips) { }
