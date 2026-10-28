package com.tripmateai.repository;

import com.tripmateai.entity.Itinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tripmateai.entity.Trip;
import java.util.*;

public interface ItineraryRepository extends JpaRepository<Itinerary, Long> {
    Optional<Itinerary> findByIdAndTrip(Long id, Trip trip);
    List<Itinerary> findByTripOrderByDayNumberAsc(Trip trip);
    boolean existsByTripAndDayNumber(Trip trip, Integer dayNumber);
}
