package com.tripmateai.service.impl;

import com.tripmateai.ai.AiProviderClient;
import com.tripmateai.dto.request.chat.ChatMessageRequest;
import com.tripmateai.entity.*;
import com.tripmateai.exception.*;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDate;
import java.util.*;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatServiceImplTest {
    @Mock private AiProviderClient provider; @Mock private ChatHistoryRepository history; @Mock private TripRepository trips;
    @Mock private ItineraryRepository itineraries; @Mock private ActivityRepository activities; @Mock private BudgetRepository budgets;
    @Mock private ExpenseRepository expenses; @Mock private PackingChecklistRepository checklists; @Mock private BookingRepository bookings;
    @InjectMocks private ChatServiceImpl service;
    private User user; private Trip trip;

    @BeforeEach void setUp(){
        user=new User();user.setId(1L);user.setEmail("user@example.com");
        trip=new Trip();trip.setId(9L);trip.setUser(user);trip.setTripName("Goa");trip.setStartDate(LocalDate.of(2026,10,1));trip.setEndDate(LocalDate.of(2026,10,4));trip.setNumberOfTravelers(2);trip.setBudget(java.math.BigDecimal.valueOf(500));
        Destination destination=new Destination();destination.setCity("Goa");destination.setCountry("India");trip.setDestination(destination);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(new UserPrincipal(user),null));
        when(trips.findByIdAndUser(9L,user)).thenReturn(Optional.of(trip)); when(expenses.findByTrip(trip)).thenReturn(List.of()); when(itineraries.findByTripOrderByDayNumberAsc(trip)).thenReturn(List.of()); when(bookings.findByTripOrderByStartAtAsc(trip)).thenReturn(List.of()); when(checklists.findByTripAndUser(trip,user)).thenReturn(Optional.empty()); when(budgets.findByTrip(trip)).thenReturn(Optional.empty());
    }
    @AfterEach void clear(){SecurityContextHolder.clearContext();}

    @Test void sendsOwnedTripContextAndPersistsConversation(){
        when(provider.chat(contains("SELECTED TRIP: name=Goa"))).thenReturn("Pack sunscreen.");
        when(history.save(any(ChatHistory.class))).thenAnswer(i->{ChatHistory h=i.getArgument(0);h.setId(5L);return h;});
        var response=service.sendMessage(new ChatMessageRequest("What should I pack?",9L));
        assertThat(response.response()).isEqualTo("Pack sunscreen."); assertThat(response.tripId()).isEqualTo(9L);
        verify(history).save(argThat(h->h.getUser()==user&&h.getTrip()==trip&&h.getPrompt().equals("What should I pack?")&&h.getResponse().equals("Pack sunscreen.")));
        verify(provider).chat(contains("Goa"));
    }

    @Test void rejectsForeignTripBeforeCallingProvider(){
        when(trips.findByIdAndUser(44L,user)).thenReturn(Optional.empty()); when(trips.existsById(44L)).thenReturn(true);
        assertThatThrownBy(()->service.sendMessage(new ChatMessageRequest("My budget?",44L))).isInstanceOf(UnauthorizedException.class);
        verifyNoInteractions(provider);
    }

    @Test void rejectsProviderFailureAndDoesNotPersist(){
        when(provider.chat(anyString())).thenThrow(new BadRequestException("AI provider request failed"));
        assertThatThrownBy(()->service.sendMessage(new ChatMessageRequest("Hello",9L))).isInstanceOf(BadRequestException.class);
        verify(history,never()).save(any());
    }

    @Test void rejectsEmptyProviderResponse(){
        when(provider.chat(anyString())).thenReturn("  ");
        assertThatThrownBy(()->service.sendMessage(new ChatMessageRequest("Hello",9L))).isInstanceOf(BadRequestException.class);
        verify(history,never()).save(any());
    }

    @Test void returnsOnlyCurrentUsersHistory(){
        ChatHistory entry=new ChatHistory();entry.setId(2L);entry.setUser(user);entry.setPrompt("Hi");entry.setResponse("Hello");
        when(history.findByUserOrderByCreatedAtAsc(user)).thenReturn(List.of(entry));
        assertThat(service.getChatHistory(null)).singleElement().extracting("message").isEqualTo("Hi");
        verify(history).findByUserOrderByCreatedAtAsc(user);
    }
}
