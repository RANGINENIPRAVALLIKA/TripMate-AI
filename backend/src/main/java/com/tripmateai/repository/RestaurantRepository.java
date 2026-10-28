package com.tripmateai.repository;

import com.tripmateai.entity.Restaurant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    List<Restaurant> findByDestinationId(Long destinationId);

    @Query("SELECT r FROM Restaurant r WHERE " +
           "(:destinationId IS NULL OR r.destination.id = :destinationId) AND " +
           "(:query IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(r.cuisine) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Restaurant> searchRestaurants(
            @Param("destinationId") Long destinationId,
            @Param("query") String query,
            Pageable pageable
    );
}
