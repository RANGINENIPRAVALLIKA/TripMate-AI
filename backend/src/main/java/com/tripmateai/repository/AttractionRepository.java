package com.tripmateai.repository;

import com.tripmateai.entity.Attraction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttractionRepository extends JpaRepository<Attraction, Long> {
    List<Attraction> findByDestinationId(Long destinationId);

    @Query("SELECT a FROM Attraction a WHERE " +
           "(:destinationId IS NULL OR a.destination.id = :destinationId) AND " +
           "(:query IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Attraction> searchAttractions(
            @Param("destinationId") Long destinationId,
            @Param("query") String query,
            Pageable pageable
    );
}
