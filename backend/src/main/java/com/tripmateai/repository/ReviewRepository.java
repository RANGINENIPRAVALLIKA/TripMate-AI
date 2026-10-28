package com.tripmateai.repository;

import com.tripmateai.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByDestinationIdOrderByCreatedAtDesc(Long targetId);
    List<Review> findByHotelIdOrderByCreatedAtDesc(Long targetId);
    List<Review> findByRestaurantIdOrderByCreatedAtDesc(Long targetId);
    List<Review> findByAttractionIdOrderByCreatedAtDesc(Long targetId);
    Optional<Review> findByIdAndUser(Long id, User user);
    boolean existsByUserAndDestination(User user, Destination target);
    boolean existsByUserAndHotel(User user, Hotel target);
    boolean existsByUserAndRestaurant(User user, Restaurant target);
    boolean existsByUserAndAttraction(User user, Attraction target);
    @Query("select avg(r.rating) from Review r where r.user = :user")
    Double averageRatingByUser(@Param("user") User user);
    @Query("select avg(r.rating) from Review r")
    Double averageRating();

    @Query("select avg(r.rating) as averageRating, count(r) as totalReviews from Review r where r.destination.id = :targetId")
    RatingSummary destinationSummary(@Param("targetId") Long targetId);
    @Query("select avg(r.rating) as averageRating, count(r) as totalReviews from Review r where r.hotel.id = :targetId")
    RatingSummary hotelSummary(@Param("targetId") Long targetId);
    @Query("select avg(r.rating) as averageRating, count(r) as totalReviews from Review r where r.restaurant.id = :targetId")
    RatingSummary restaurantSummary(@Param("targetId") Long targetId);
    @Query("select avg(r.rating) as averageRating, count(r) as totalReviews from Review r where r.attraction.id = :targetId")
    RatingSummary attractionSummary(@Param("targetId") Long targetId);

    interface RatingSummary { Double getAverageRating(); long getTotalReviews(); }
}
