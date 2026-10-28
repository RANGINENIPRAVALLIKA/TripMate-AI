package com.tripmateai.repository; import com.tripmateai.entity.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*; public interface JournalPhotoRepository extends JpaRepository<JournalPhoto, Long> {
    List<JournalPhoto> findByJournalOrderBySortOrderAsc(TravelJournal journal);
    List<JournalPhoto> findByJournalTripOrderByCreatedAtDesc(Trip trip);
    Optional<JournalPhoto> findByIdAndJournal(Long id, TravelJournal journal);
}
