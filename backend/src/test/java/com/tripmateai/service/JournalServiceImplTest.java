package com.tripmateai.service;

import com.tripmateai.dto.request.journal.CreateJournalEntryRequest;
import com.tripmateai.entity.*;
import com.tripmateai.exception.UnauthorizedException;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.impl.JournalServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class JournalServiceImplTest {

    @Mock
    private TripRepository trips;

    @Mock
    private TravelJournalRepository journals;

    @Mock
    private JournalPhotoRepository photos;

    @Mock
    private MediaStorageService mediaStorageService;

    @InjectMocks
    private JournalServiceImpl journalService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        currentUser = new User();
        currentUser.setId(1L);
        currentUser.setEmail("traveller@tripmate.ai");

        var principal = new UserPrincipal(currentUser);
        var auth = new UsernamePasswordAuthenticationToken(principal, null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createJournalEntry_enforcesTripOwnership() {
        when(trips.findByIdAndUser(eq(99L), eq(currentUser))).thenReturn(Optional.empty());
        when(trips.existsById(eq(99L))).thenReturn(true);

        var request = new CreateJournalEntryRequest(LocalDate.now(), "Varanasi Ghat Sunrise", "Mesmerizing Aarti");
        assertThrows(UnauthorizedException.class, () -> journalService.create(99L, request));
    }

    @Test
    void uploadPhoto_storesFileAndSavesJournalPhoto() {
        var trip = new Trip();
        trip.setId(5L);
        trip.setUser(currentUser);

        var journal = new TravelJournal();
        journal.setId(12L);
        journal.setTrip(trip);

        when(trips.findByIdAndUser(eq(5L), eq(currentUser))).thenReturn(Optional.of(trip));
        when(journals.findByIdAndTrip(eq(12L), eq(trip))).thenReturn(Optional.of(journal));

        when(mediaStorageService.store(any(), eq("journal")))
                .thenReturn(new MediaStorageService.StoredMedia("photo-1.jpg", "/api/media/journal/photo-1.jpg", "image/jpeg", 1024, false));

        when(photos.findByJournalOrderBySortOrderAsc(journal)).thenReturn(List.of());
        when(photos.save(any(JournalPhoto.class))).thenAnswer(inv -> {
            JournalPhoto p = inv.getArgument(0);
            p.setId(101L);
            return p;
        });

        MockMultipartFile file = new MockMultipartFile("file", "temple.jpg", "image/jpeg", "image-bytes".getBytes());
        var res = journalService.uploadPhoto(5L, 12L, file, "Golden Temple View");

        assertNotNull(res);
        assertEquals(101L, res.id());
        assertEquals("/api/media/journal/photo-1.jpg", res.imageUrl());
        assertEquals("Golden Temple View", res.caption());
        verify(photos).save(any(JournalPhoto.class));
    }
}
