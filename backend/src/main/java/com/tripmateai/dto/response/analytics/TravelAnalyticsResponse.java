package com.tripmateai.dto.response.analytics;
import com.tripmateai.enums.FavoriteTargetType;
import java.math.BigDecimal;
import java.util.*;
public record TravelAnalyticsResponse(TripAnalyticsResponse trips, ExpenseAnalyticsResponse expenses,
                                      long totalDestinations, List<DestinationAnalyticsResponse> destinations,
                                      DestinationAnalyticsResponse mostFrequentDestination,
                                      Map<FavoriteTargetType, Long> favoritesByType,
                                      BigDecimal averageReviewRatingGiven) { }
