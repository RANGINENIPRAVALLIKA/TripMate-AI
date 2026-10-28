package com.tripmateai.repository;

import com.tripmateai.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;
import com.tripmateai.entity.*;
import org.springframework.data.domain.*;
import java.util.Optional;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long> {
    boolean existsByUserAndTrip(User user, Trip trip);
    Optional<SavedTrip> findByUserAndTrip(User user, Trip trip);
    Page<SavedTrip> findByUser(User user, Pageable pageable);
}
