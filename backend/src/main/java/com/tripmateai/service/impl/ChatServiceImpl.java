package com.tripmateai.service.impl;

import com.tripmateai.ai.AiProviderClient;
import com.tripmateai.dto.request.chat.ChatMessageRequest;
import com.tripmateai.dto.response.chat.*;
import com.tripmateai.entity.*;
import com.tripmateai.exception.*;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Service @RequiredArgsConstructor @Transactional
public class ChatServiceImpl implements ChatService {
    private final AiProviderClient provider; private final ChatHistoryRepository history; private final TripRepository trips;
    private final ItineraryRepository itineraries; private final ActivityRepository activities; private final BudgetRepository budgets;
    private final ExpenseRepository expenses; private final PackingChecklistRepository checklists; private final BookingRepository bookings;
    @Value("${app.ai.model:gpt-4o-mini}") private String model;

    @Override public ChatMessageResponse sendMessage(ChatMessageRequest request) {
        User user=currentUser(); Trip trip=request.tripId()==null?null:ownedTrip(request.tripId(),user);
        String answer=provider.chat(prompt(request.message().trim(),trip,user));
        if(answer==null||answer.isBlank())throw new BadRequestException("AI provider returned an empty response");
        ChatHistory entry=new ChatHistory(); entry.setUser(user); entry.setTrip(trip); entry.setPrompt(request.message().trim()); entry.setResponse(answer.trim()); entry.setModel(model); entry.setCreatedBy(user.getId());
        return response(history.save(entry));
    }
    @Override @Transactional(readOnly=true) public List<ChatHistoryResponse> getChatHistory(Long tripId) {
        User user=currentUser(); List<ChatHistory> entries=tripId==null?history.findByUserOrderByCreatedAtAsc(user):history.findByUserAndTripOrderByCreatedAtAsc(user,ownedTrip(tripId,user));
        return entries.stream().map(this::historyResponse).toList();
    }
    private Trip ownedTrip(Long id,User user){return trips.findByIdAndUser(id,user).orElseThrow(()->trips.existsById(id)?new UnauthorizedException("You do not have access to this trip"):new ResourceNotFoundException("Trip not found"));}
    private User currentUser(){Object p=SecurityContextHolder.getContext().getAuthentication().getPrincipal();if(!(p instanceof UserPrincipal user))throw new UnauthorizedException("Authentication required");return user.user();}
    private String prompt(String question,Trip trip,User user){
        StringBuilder context=new StringBuilder("You are TripMate AI, a concise travel assistant. Answer travel questions using only the supplied application context for application-specific facts. Do not claim access to data not supplied. Never reveal credentials, authentication data, or other users' information. You may suggest itinerary changes but must not claim to execute changes. Ask for clarification where needed.\nUSER QUESTION: ").append(question);
        if(trip==null)return context.append("\nNo trip was selected. Provide general travel guidance only.").toString();
        context.append("\nSELECTED TRIP: name=").append(trip.getTripName()).append(", destination=").append(trip.getDestination().getCity()).append(", ").append(trip.getDestination().getCountry()).append(", dates=").append(trip.getStartDate()).append(" to ").append(trip.getEndDate()).append(", travelers=").append(trip.getNumberOfTravelers()).append(", plannedBudget=").append(trip.getBudget()).append(", preferences=").append(trip.getPreferences());
        budgets.findByTrip(trip).ifPresent(b->context.append("\nBUDGET: total=").append(b.getTotalBudget()).append(", allocated=").append(b.getAllocatedAmount()));
        BigDecimal spent=expenses.findByTrip(trip).stream().map(Expense::getAmount).reduce(BigDecimal.ZERO,BigDecimal::add); context.append("\nEXPENSES: totalSpent=").append(spent);
        context.append("\nITINERARY:"); for(Itinerary day:itineraries.findByTripOrderByDayNumberAsc(trip)){context.append(" day ").append(day.getDayNumber()).append(" ").append(safe(day.getTitle())).append(":"); for(Activity activity:activities.findByItineraryOrderBySortOrderAsc(day))context.append(" [").append(activity.getTitle()).append(" at ").append(safe(activity.getLocation())).append("]");}
        checklists.findByTripAndUser(trip,user).ifPresent(c->{context.append("\nPACKING:");for(PackingItem item:c.getItems())context.append(" [").append(item.getName()).append(" x").append(item.getQuantity()).append(item.isPacked()?", packed":", not packed").append("]");});
        context.append("\nBOOKINGS:");for(Booking booking:bookings.findByTripOrderByStartAtAsc(trip))context.append(" [").append(booking.getType()).append(", provider=").append(booking.getProvider()).append(", status=").append(booking.getStatus()).append("]");
        return context.toString();
    }
    private String safe(String value){return value==null?"unspecified":value;}
    private ChatMessageResponse response(ChatHistory entry){return new ChatMessageResponse(entry.getId(),entry.getTrip()==null?null:entry.getTrip().getId(),entry.getPrompt(),entry.getResponse(),entry.getModel(),entry.getCreatedAt());}
    private ChatHistoryResponse historyResponse(ChatHistory entry){return new ChatHistoryResponse(entry.getId(),entry.getTrip()==null?null:entry.getTrip().getId(),entry.getPrompt(),entry.getResponse(),entry.getCreatedAt());}
}
