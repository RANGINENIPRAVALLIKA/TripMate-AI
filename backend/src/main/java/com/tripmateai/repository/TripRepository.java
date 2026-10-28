package com.tripmateai.repository;

import com.tripmateai.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.*;
import com.tripmateai.entity.User;
import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import com.tripmateai.enums.TripStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Page<Trip> findByUser(User user, Pageable pageable);
    Optional<Trip> findByIdAndUser(Long id, User user);
    Page<Trip> findByUserAndEndDateBefore(User user, LocalDate date, Pageable pageable);
    long countByUser(User user);
    long countByUserAndTripStatus(User user, TripStatus tripStatus);
    long countByTripStatus(TripStatus tripStatus);
    @Query("select count(t) from Trip t where t.user = :user and t.startDate >= :today and t.tripStatus in (com.tripmateai.enums.TripStatus.PLANNING, com.tripmateai.enums.TripStatus.CONFIRMED)")
    long countUpcomingForUser(@Param("user") User user, @Param("today") LocalDate today);
    @Query("select count(t) from Trip t where t.startDate >= :today and t.tripStatus in (com.tripmateai.enums.TripStatus.PLANNING, com.tripmateai.enums.TripStatus.CONFIRMED)")
    long countUpcoming(@Param("today") LocalDate today);
    List<Trip> findTop5ByOrderByCreatedAtDesc();
    @Query("select coalesce(sum(t.budget), 0) from Trip t where t.user = :user")
    BigDecimal sumBudgetByUser(@Param("user") User user);
    @Query("select count(distinct t.destination.id) from Trip t where t.user = :user")
    long countDistinctDestinationsByUser(@Param("user") User user);
    @Query("select t.tripStatus as status, count(t) as total from Trip t where t.user = :user group by t.tripStatus")
    List<TripStatusTotal> statusTotalsByUser(@Param("user") User user);
    @Query("select t.tripStatus as status, count(t) as total from Trip t group by t.tripStatus")
    List<TripStatusTotal> statusTotals();
    @Query("select t.destination.id as destinationId, t.destination.city as city, t.destination.country as country, count(t) as tripCount from Trip t where t.user = :user group by t.destination.id, t.destination.city, t.destination.country order by count(t) desc, t.destination.city asc")
    List<DestinationTripTotal> destinationTotalsByUser(@Param("user") User user);
    @Query(value = "select date_format(start_date, '%Y-%m') as month, count(*) as total from trips where user_id = :userId group by date_format(start_date, '%Y-%m') order by month", nativeQuery = true)
    List<MonthlyTotal> monthlyTripTotalsByUser(@Param("userId") Long userId);

    interface TripStatusTotal { TripStatus getStatus(); long getTotal(); }
    interface DestinationTripTotal { Long getDestinationId(); String getCity(); String getCountry(); long getTripCount(); }
    interface MonthlyTotal { String getMonth(); long getTotal(); }
}
