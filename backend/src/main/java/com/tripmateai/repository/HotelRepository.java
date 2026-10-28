package com.tripmateai.repository;

import com.tripmateai.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByDestinationId(Long destinationId);

    @Query("SELECT h FROM Hotel h WHERE " +
           "(:destinationId IS NULL OR h.destination.id = :destinationId) AND " +
           "(:query IS NULL OR LOWER(h.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(h.address) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Hotel> searchHotels(
            @Param("destinationId") Long destinationId,
            @Param("query") String query,
            Pageable pageable
    );
}
