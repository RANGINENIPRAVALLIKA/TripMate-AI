package com.tripmateai.dto.response.admin;
import com.tripmateai.enums.TripStatus;
import java.util.*;
public record AdminTripStatsResponse(long totalTrips, long completedTrips, long upcomingTrips, Map<TripStatus, Long> statusDistribution, List<AdminRecentTripResponse> recentTrips) { }
