package com.tripmateai.repository;

import com.tripmateai.entity.Destination;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface DestinationRepository extends JpaRepository<Destination, Long> {
    Optional<Destination> findByCityIgnoreCase(String city);

    Optional<Destination> findByCityIgnoreCaseAndStateIgnoreCase(String city, String state);

    List<Destination> findAllByOrderByCityAsc();

    @Query("SELECT d FROM Destination d WHERE " +
           "(:query IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :query, '%')) OR (d.state IS NOT NULL AND LOWER(d.state) LIKE LOWER(CONCAT('%', :query, '%'))) OR LOWER(d.country) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:country IS NULL OR LOWER(d.country) = LOWER(:country)) AND " +
           "(:state IS NULL OR (d.state IS NOT NULL AND LOWER(d.state) = LOWER(:state))) AND " +
           "(:bestSeason IS NULL OR LOWER(d.bestSeason) LIKE LOWER(CONCAT('%', :bestSeason, '%')))")
    Page<Destination> searchDestinations(
            @Param("query") String query,
            @Param("country") String country,
            @Param("state") String state,
            @Param("bestSeason") String bestSeason,
            Pageable pageable
    );
}
