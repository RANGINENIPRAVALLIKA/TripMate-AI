package com.tripmateai.service.impl;

import com.tripmateai.dto.response.admin.*;
import com.tripmateai.entity.*;
import com.tripmateai.enums.*;
import com.tripmateai.exception.UnauthorizedException;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.LocalDate;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {
    private final UserRepository users; private final TripRepository trips; private final DestinationRepository destinations;
    private final HotelRepository hotels; private final RestaurantRepository restaurants; private final AttractionRepository attractions;
    private final ReviewRepository reviews; private final FavoriteRepository favorites; private final BookingRepository bookings; private final AdminLogRepository adminLogs;

    @Override public AdminDashboardResponse getDashboard() {
        requireAdmin();
        return new AdminDashboardResponse(userStats(), tripStats(), new AdminContentStatsResponse(destinations.count(), hotels.count(), restaurants.count(), attractions.count(), favorites.count(), bookings.count()), reviewStats(), recentActivity());
    }
    private AdminUserStatsResponse userStats() { return new AdminUserStatsResponse(users.count(), users.findTop5ByOrderByCreatedAtDesc().stream().map(this::user).toList()); }
    private AdminTripStatsResponse tripStats() {
        Map<TripStatus, Long> statuses = new EnumMap<>(TripStatus.class); for (TripStatus status : TripStatus.values()) statuses.put(status, 0L);
        for (TripRepository.TripStatusTotal total : trips.statusTotals()) statuses.put(total.getStatus(), total.getTotal());
        return new AdminTripStatsResponse(trips.count(), trips.countByTripStatus(TripStatus.COMPLETED), trips.countUpcoming(LocalDate.now()), statuses, trips.findTop5ByOrderByCreatedAtDesc().stream().map(this::trip).toList());
    }
    private AdminReviewStatsResponse reviewStats() { Double average = reviews.averageRating(); return new AdminReviewStatsResponse(reviews.count(), average == null ? BigDecimal.ZERO : BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP)); }
    private List<AdminRecentActivityResponse> recentActivity() { return adminLogs.findTop5ByOrderByCreatedAtDesc().stream().map(log -> new AdminRecentActivityResponse(log.getId(), log.getAdmin().getId(), log.getAction(), log.getTargetType(), log.getTargetId(), log.getCreatedAt())).toList(); }
    private AdminRecentUserResponse user(User user) { return new AdminRecentUserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getCreatedAt()); }
    private AdminRecentTripResponse trip(Trip trip) { return new AdminRecentTripResponse(trip.getId(), trip.getTripName(), trip.getDestination().getCity(), trip.getTripStatus(), trip.getStartDate(), trip.getCreatedAt()); }
    private void requireAdmin() { var authentication = SecurityContextHolder.getContext().getAuthentication(); Object principal = authentication == null ? null : authentication.getPrincipal(); if (!(principal instanceof UserPrincipal userPrincipal) || userPrincipal.getAuthorities().stream().noneMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"))) throw new UnauthorizedException("Administrator access is required"); }
}
