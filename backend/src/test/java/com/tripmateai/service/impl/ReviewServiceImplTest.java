package com.tripmateai.service.impl;

import com.tripmateai.dto.request.review.*;
import com.tripmateai.entity.*;
import com.tripmateai.enums.ReviewType;
import com.tripmateai.exception.*;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import jakarta.validation.Validation;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {
    @Mock private ReviewRepository reviews;
    @Mock private DestinationRepository destinations;
    @Mock private HotelRepository hotels;
    @Mock private RestaurantRepository restaurants;
    @Mock private AttractionRepository attractions;
    @InjectMocks private ReviewServiceImpl service;

    private User currentUser;

    @BeforeEach
    void setUp() {
        currentUser = user(1L, "Ada Lovelace");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(new UserPrincipal(currentUser), null));
    }

    @AfterEach
    void clearContext() { SecurityContextHolder.clearContext(); }

    @Test
    void createsDestinationReviewForAuthenticatedUser() {
        Destination destination = new Destination();
        destination.setId(10L);
        destination.setCity("Jaipur");
        when(destinations.findById(10L)).thenReturn(Optional.of(destination));
        when(reviews.save(any(Review.class))).thenAnswer(invocation -> {
            Review review = invocation.getArgument(0);
            review.setId(20L);
            return review;
        });

        var response = service.create(new CreateReviewRequest(ReviewType.DESTINATION, 10L, 5, "Wonderful"));

        assertThat(response.id()).isEqualTo(20L);
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.targetType()).isEqualTo(ReviewType.DESTINATION);
        assertThat(response.targetId()).isEqualTo(10L);
        verify(reviews).save(argThat(review -> review.getUser() == currentUser
                && review.getDestination() == destination && review.getRating() == 5));
    }

    @Test
    void retrievesReviewsForTarget() {
        Destination destination = new Destination();
        destination.setId(10L);
        destination.setCity("Jaipur");
        Review review = new Review();
        review.setId(20L);
        review.setUser(currentUser);
        review.setReviewType(ReviewType.DESTINATION);
        review.setDestination(destination);
        review.setRating(4);
        when(destinations.findById(10L)).thenReturn(Optional.of(destination));
        when(reviews.findByDestinationIdOrderByCreatedAtDesc(10L)).thenReturn(List.of(review));

        assertThat(service.list(ReviewType.DESTINATION, 10L)).hasSize(1)
                .first().extracting("rating").isEqualTo(4);
    }

    @Test
    void rejectsUpdateByAnotherUser() {
        Review review = new Review();
        review.setId(20L);
        review.setUser(user(2L, "Grace Hopper"));
        when(reviews.findById(20L)).thenReturn(Optional.of(review));

        assertThatThrownBy(() -> service.update(20L, new UpdateReviewRequest(4, "Updated")))
                .isInstanceOf(UnauthorizedException.class);
        verify(reviews, never()).save(any());
    }

    @Test
    void rejectsNonExistentTarget() {
        when(destinations.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(new CreateReviewRequest(ReviewType.DESTINATION, 999L, 5, null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void returnsDatabaseRatingSummary() {
        Destination destination = new Destination();
        destination.setId(10L);
        when(destinations.findById(10L)).thenReturn(Optional.of(destination));
        ReviewRepository.RatingSummary aggregate = mock(ReviewRepository.RatingSummary.class);
        when(aggregate.getAverageRating()).thenReturn(4.25);
        when(aggregate.getTotalReviews()).thenReturn(8L);
        when(reviews.destinationSummary(10L)).thenReturn(aggregate);

        var summary = service.summary(ReviewType.DESTINATION, 10L);

        assertThat(summary.averageRating()).isEqualByComparingTo("4.25");
        assertThat(summary.totalReviews()).isEqualTo(8L);
    }

    @Test
    void preservesExistingModelByAllowingMultipleReviewsForTheSameTarget() {
        Destination destination = new Destination();
        destination.setId(10L);
        destination.setCity("Jaipur");
        when(destinations.findById(10L)).thenReturn(Optional.of(destination));
        when(reviews.save(any(Review.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(new CreateReviewRequest(ReviewType.DESTINATION, 10L, 5, "First visit"));
        service.create(new CreateReviewRequest(ReviewType.DESTINATION, 10L, 4, "Second visit"));

        verify(reviews, times(2)).save(any(Review.class));
    }

    @Test
    void rejectsAnOutOfRangeRatingAtRequestValidation() {
        var validator = Validation.buildDefaultValidatorFactory().getValidator();
        var violations = validator.validate(new CreateReviewRequest(ReviewType.HOTEL, 10L, 6, "Invalid"));

        assertThat(violations).extracting(violation -> violation.getPropertyPath().toString()).contains("rating");
    }

    private User user(Long id, String name) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(name.replace(' ', '.').toLowerCase() + "@example.com");
        return user;
    }
}
