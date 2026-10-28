package com.tripmateai.service.impl;

import com.tripmateai.dto.response.analytics.*;
import com.tripmateai.entity.User;
import com.tripmateai.enums.*;
import com.tripmateai.exception.UnauthorizedException;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {
    private final TripRepository trips;
    private final ExpenseRepository expenses;
    private final FavoriteRepository favorites;
    private final ReviewRepository reviews;

    @Override
    public TravelAnalyticsResponse getMyTravelAnalytics() {
        User user = currentUser();
        BigDecimal totalBudget = zero(trips.sumBudgetByUser(user));
        BigDecimal totalExpenses = zero(expenses.sumAmountByUser(user));
        List<DestinationAnalyticsResponse> destinations = trips.destinationTotalsByUser(user).stream()
                .map(total -> new DestinationAnalyticsResponse(total.getDestinationId(), total.getCity(), total.getCountry(), total.getTripCount())).toList();
        return new TravelAnalyticsResponse(
                tripAnalytics(user, totalBudget), expenseAnalytics(user, totalExpenses, totalBudget),
                trips.countDistinctDestinationsByUser(user), destinations,
                destinations.isEmpty() ? null : destinations.getFirst(), favoriteCounts(user),
                average(reviews.averageRatingByUser(user)));
    }

    private TripAnalyticsResponse tripAnalytics(User user, BigDecimal totalBudget) {
        Map<TripStatus, Long> statuses = new EnumMap<>(TripStatus.class);
        for (TripStatus status : TripStatus.values()) statuses.put(status, 0L);
        for (TripRepository.TripStatusTotal total : trips.statusTotalsByUser(user)) statuses.put(total.getStatus(), total.getTotal());
        List<MonthlyTripAnalyticsResponse> monthly = trips.monthlyTripTotalsByUser(user.getId()).stream()
                .map(total -> new MonthlyTripAnalyticsResponse(total.getMonth(), total.getTotal())).toList();
        return new TripAnalyticsResponse(trips.countByUser(user), trips.countByUserAndTripStatus(user, TripStatus.COMPLETED),
                trips.countUpcomingForUser(user, LocalDate.now()), totalBudget, statuses, monthly);
    }

    private ExpenseAnalyticsResponse expenseAnalytics(User user, BigDecimal totalExpenses, BigDecimal totalBudget) {
        List<ExpenseCategoryAnalyticsResponse> breakdown = expenses.categoryTotalsByUser(user).stream()
                .map(total -> new ExpenseCategoryAnalyticsResponse(total.getCategory(), zero(total.getTotal()))).toList();
        List<MonthlyExpenseAnalyticsResponse> monthly = expenses.monthlyTotalsByUser(user.getId()).stream()
                .map(total -> new MonthlyExpenseAnalyticsResponse(total.getMonth(), zero(total.getTotal()))).toList();
        return new ExpenseAnalyticsResponse(totalExpenses, totalBudget.subtract(totalExpenses), breakdown, monthly);
    }

    private Map<FavoriteTargetType, Long> favoriteCounts(User user) {
        Map<FavoriteTargetType, Long> counts = new EnumMap<>(FavoriteTargetType.class);
        counts.put(FavoriteTargetType.DESTINATION, favorites.countByUserAndDestinationIsNotNull(user));
        counts.put(FavoriteTargetType.HOTEL, favorites.countByUserAndHotelIsNotNull(user));
        counts.put(FavoriteTargetType.RESTAURANT, favorites.countByUserAndRestaurantIsNotNull(user));
        counts.put(FavoriteTargetType.ATTRACTION, favorites.countByUserAndAttractionIsNotNull(user));
        return counts;
    }

    private User currentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof UserPrincipal userPrincipal)) throw new UnauthorizedException("Authentication required");
        return userPrincipal.user();
    }

    private BigDecimal zero(BigDecimal value) { return value == null ? BigDecimal.ZERO : value; }
    private BigDecimal average(Double value) { return value == null ? BigDecimal.ZERO : BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP); }
}
