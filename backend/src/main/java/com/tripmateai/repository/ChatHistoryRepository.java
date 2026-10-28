package com.tripmateai.repository;
import com.tripmateai.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    List<ChatHistory> findByUserOrderByCreatedAtAsc(User user);
    List<ChatHistory> findByUserAndTripOrderByCreatedAtAsc(User user, Trip trip);
}
