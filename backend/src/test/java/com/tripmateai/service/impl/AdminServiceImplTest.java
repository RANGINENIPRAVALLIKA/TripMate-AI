package com.tripmateai.service.impl;

import com.tripmateai.entity.*;
import com.tripmateai.enums.*;
import com.tripmateai.exception.UnauthorizedException;
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
class AdminServiceImplTest {
    @Mock private UserRepository users; @Mock private TripRepository trips; @Mock private DestinationRepository destinations;
    @Mock private HotelRepository hotels; @Mock private RestaurantRepository restaurants; @Mock private AttractionRepository attractions;
    @Mock private ReviewRepository reviews; @Mock private FavoriteRepository favorites; @Mock private BookingRepository bookings; @Mock private AdminLogRepository adminLogs;
    @InjectMocks private AdminServiceImpl service;

    @BeforeEach void defaults() {
        when(users.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of()); when(trips.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of());
        when(trips.statusTotals()).thenReturn(List.of()); when(adminLogs.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of());
    }
    @AfterEach void clearSecurity(){SecurityContextHolder.clearContext();}

    @Test void returnsSystemMetricsForAdmin() {
        authenticate(RoleName.ADMIN);
        when(users.count()).thenReturn(12L); when(trips.count()).thenReturn(8L); when(trips.countByTripStatus(TripStatus.COMPLETED)).thenReturn(3L); when(trips.countUpcoming(any())).thenReturn(2L);
        when(destinations.count()).thenReturn(5L); when(hotels.count()).thenReturn(10L); when(restaurants.count()).thenReturn(7L); when(attractions.count()).thenReturn(9L);
        when(favorites.count()).thenReturn(18L); when(bookings.count()).thenReturn(6L); when(reviews.count()).thenReturn(4L); when(reviews.averageRating()).thenReturn(4.25);

        var dashboard=service.getDashboard();

        assertThat(dashboard.users().totalUsers()).isEqualTo(12L); assertThat(dashboard.trips().totalTrips()).isEqualTo(8L);
        assertThat(dashboard.trips().completedTrips()).isEqualTo(3L); assertThat(dashboard.trips().upcomingTrips()).isEqualTo(2L);
        assertThat(dashboard.content().hotels()).isEqualTo(10L); assertThat(dashboard.content().favorites()).isEqualTo(18L);
        assertThat(dashboard.reviews().averageRating()).isEqualByComparingTo("4.25");
    }

    @Test void rejectsNormalUser() { authenticate(RoleName.USER); assertThatThrownBy(service::getDashboard).isInstanceOf(UnauthorizedException.class); }

    @Test void rejectsUnauthenticatedRequest() { SecurityContextHolder.clearContext(); assertThatThrownBy(service::getDashboard).isInstanceOf(UnauthorizedException.class); }

    @Test void returnsZeroValuesForEmptyData() {
        authenticate(RoleName.ADMIN); when(reviews.averageRating()).thenReturn(null);
        var dashboard=service.getDashboard();
        assertThat(dashboard.users().totalUsers()).isZero(); assertThat(dashboard.trips().totalTrips()).isZero();
        assertThat(dashboard.content().destinations()).isZero(); assertThat(dashboard.reviews().totalReviews()).isZero();
        assertThat(dashboard.reviews().averageRating()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    private void authenticate(RoleName roleName) {
        User user=new User(); user.setId(1L); user.setEmail("admin@example.com"); Role role=new Role(); role.setName(roleName); user.setRoles(Set.of(role));
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(user),null));
    }
}
