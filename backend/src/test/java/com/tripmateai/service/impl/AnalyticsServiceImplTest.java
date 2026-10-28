package com.tripmateai.service.impl;

import com.tripmateai.entity.User;
import com.tripmateai.enums.*;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.math.BigDecimal;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AnalyticsServiceImplTest {
    @Mock private TripRepository trips;
    @Mock private ExpenseRepository expenses;
    @Mock private FavoriteRepository favorites;
    @Mock private ReviewRepository reviews;
    @InjectMocks private AnalyticsServiceImpl service;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User(); user.setId(17L); user.setFullName("Analytics User"); user.setEmail("analytics@example.com");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(user), null));
        when(trips.sumBudgetByUser(user)).thenReturn(new BigDecimal("1500.00"));
        when(expenses.sumAmountByUser(user)).thenReturn(new BigDecimal("450.25"));
        when(trips.destinationTotalsByUser(user)).thenReturn(List.of(destinationTotal(8L, "Jaipur", "India", 3L)));
        when(trips.countDistinctDestinationsByUser(user)).thenReturn(1L);
        when(trips.countByUser(user)).thenReturn(4L);
        when(trips.countByUserAndTripStatus(user, TripStatus.COMPLETED)).thenReturn(2L);
        when(trips.countUpcomingForUser(eq(user), any())).thenReturn(1L);
        when(trips.statusTotalsByUser(user)).thenReturn(List.of(statusTotal(TripStatus.COMPLETED, 2L), statusTotal(TripStatus.PLANNING, 2L)));
        when(trips.monthlyTripTotalsByUser(17L)).thenReturn(List.of(monthlyTrip("2026-09", 2L)));
        when(expenses.categoryTotalsByUser(user)).thenReturn(List.of(categoryTotal("Food", new BigDecimal("250.25"))));
        when(expenses.monthlyTotalsByUser(17L)).thenReturn(List.of(monthlyExpense("2026-09", new BigDecimal("450.25"))));
        when(favorites.countByUserAndDestinationIsNotNull(user)).thenReturn(2L);
        when(favorites.countByUserAndHotelIsNotNull(user)).thenReturn(1L);
        when(favorites.countByUserAndRestaurantIsNotNull(user)).thenReturn(0L);
        when(favorites.countByUserAndAttractionIsNotNull(user)).thenReturn(3L);
        when(reviews.averageRatingByUser(user)).thenReturn(4.5);
    }

    @AfterEach void clearSecurity() { SecurityContextHolder.clearContext(); }

    @Test
    void returnsAnalyticsOnlyForTheAuthenticatedUser() {
        var result = service.getMyTravelAnalytics();

        assertThat(result.trips().totalTrips()).isEqualTo(4L);
        assertThat(result.trips().completedTrips()).isEqualTo(2L);
        assertThat(result.trips().upcomingTrips()).isEqualTo(1L);
        assertThat(result.trips().totalBudget()).isEqualByComparingTo("1500.00");
        assertThat(result.expenses().totalExpenses()).isEqualByComparingTo("450.25");
        assertThat(result.expenses().remainingBudget()).isEqualByComparingTo("1049.75");
        assertThat(result.expenses().expenseBreakdown()).singleElement().extracting("category").isEqualTo("Food");
        assertThat(result.mostFrequentDestination().city()).isEqualTo("Jaipur");
        assertThat(result.favoritesByType().get(FavoriteTargetType.ATTRACTION)).isEqualTo(3L);
        assertThat(result.averageReviewRatingGiven()).isEqualByComparingTo("4.50");
        verify(trips).countByUser(user);
        verify(expenses).sumAmountByUser(user);
    }

    @Test
    void returnsAValidZeroAndEmptyDashboardForAUserWithoutData() {
        User emptyUser = new User(); emptyUser.setId(18L); emptyUser.setFullName("Empty User"); emptyUser.setEmail("empty@example.com");
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(emptyUser), null));
        when(trips.destinationTotalsByUser(emptyUser)).thenReturn(List.of());
        when(trips.statusTotalsByUser(emptyUser)).thenReturn(List.of());
        when(trips.monthlyTripTotalsByUser(18L)).thenReturn(List.of());
        when(expenses.categoryTotalsByUser(emptyUser)).thenReturn(List.of());
        when(expenses.monthlyTotalsByUser(18L)).thenReturn(List.of());

        var result = service.getMyTravelAnalytics();

        assertThat(result.trips().totalTrips()).isZero();
        assertThat(result.trips().totalBudget()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.expenses().totalExpenses()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.expenses().remainingBudget()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.destinations()).isEmpty();
        assertThat(result.mostFrequentDestination()).isNull();
        assertThat(result.averageReviewRatingGiven()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    private TripRepository.DestinationTripTotal destinationTotal(Long id, String city, String country, long count) {
        return new TripRepository.DestinationTripTotal() { public Long getDestinationId(){return id;} public String getCity(){return city;} public String getCountry(){return country;} public long getTripCount(){return count;} };
    }
    private TripRepository.TripStatusTotal statusTotal(TripStatus status, long total) { return new TripRepository.TripStatusTotal() { public TripStatus getStatus(){return status;} public long getTotal(){return total;} }; }
    private TripRepository.MonthlyTotal monthlyTrip(String month, long total) { return new TripRepository.MonthlyTotal() { public String getMonth(){return month;} public long getTotal(){return total;} }; }
    private ExpenseRepository.CategoryTotal categoryTotal(String category, BigDecimal total) { return new ExpenseRepository.CategoryTotal() { public String getCategory(){return category;} public BigDecimal getTotal(){return total;} }; }
    private ExpenseRepository.MonthlyTotal monthlyExpense(String month, BigDecimal total) { return new ExpenseRepository.MonthlyTotal() { public String getMonth(){return month;} public BigDecimal getTotal(){return total;} }; }
}
