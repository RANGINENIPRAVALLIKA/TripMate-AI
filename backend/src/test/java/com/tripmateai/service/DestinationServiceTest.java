package com.tripmateai.service;

import com.tripmateai.config.IndianDestinationCatalog;
import com.tripmateai.entity.Destination;
import com.tripmateai.repository.DestinationRepository;
import com.tripmateai.service.impl.DestinationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class DestinationServiceTest {

    @Mock
    private DestinationRepository destinationRepository;

    @InjectMocks
    private DestinationServiceImpl destinationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void indianDestinationCatalog_containsOver100VerifiedDestinations() {
        var catalog = IndianDestinationCatalog.getDestinations();
        assertTrue(catalog.size() >= 100, "Catalog should contain at least 100 Indian destinations");

        long uniqueCities = catalog.stream().map(IndianDestinationCatalog.DestinationSeed::city).distinct().count();
        assertEquals(catalog.size(), uniqueCities, "All destinations in catalog should have distinct city names");

        for (var seed : catalog) {
            assertNotNull(seed.city(), "Destination city must not be null");
            assertNotNull(seed.state(), "State must not be null for " + seed.city());
            assertEquals("India", seed.country(), "Country must be India for " + seed.city());
            assertTrue(seed.averageBudget().compareTo(BigDecimal.ZERO) > 0, "Average cost in INR must be positive for " + seed.city());
        }
    }

    @Test
    void searchDestinations_filtersByStateAndQuery() {
        var d = new Destination();
        d.setId(10L);
        d.setCity("Munnar");
        d.setState("Kerala");
        d.setCountry("India");

        when(destinationRepository.searchDestinations(eq("Munnar"), isNull(), eq("Kerala"), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(d)));

        var result = destinationService.search("Munnar", null, "Kerala", null, Pageable.unpaged());
        assertEquals(1, result.getTotalElements());
        assertEquals("Munnar", result.getContent().get(0).city());
        assertEquals("Kerala", result.getContent().get(0).state());
    }

    @Test
    void getOrCreateCustom_createsNewIndianDestinationWhenNotFound() {
        when(destinationRepository.findByCityIgnoreCase("Lambasingi")).thenReturn(java.util.Optional.empty());
        when(destinationRepository.save(any(Destination.class))).thenAnswer(inv -> {
            Destination saved = inv.getArgument(0);
            saved.setId(999L);
            return saved;
        });

        var resp = destinationService.getOrCreateCustom("Lambasingi", "Andhra Pradesh");
        assertNotNull(resp);
        assertEquals(999L, resp.id());
        assertEquals("Lambasingi", resp.city());
        assertEquals("Andhra Pradesh", resp.state());
        assertEquals("India", resp.country());
    }

    @Test
    void getOrCreateCustom_returnsExistingWhenFound() {
        Destination existing = new Destination();
        existing.setId(42L);
        existing.setCity("Araku Valley");
        existing.setState("Andhra Pradesh");
        existing.setCountry("India");

        when(destinationRepository.findByCityIgnoreCase("Araku Valley")).thenReturn(java.util.Optional.of(existing));

        var resp = destinationService.getOrCreateCustom("Araku Valley", null);
        assertNotNull(resp);
        assertEquals(42L, resp.id());
        assertEquals("Araku Valley", resp.city());
    }

    @Test
    void getOrCreateCustom_throwsBadRequestWhenCityIsBlank() {
        assertThrows(com.tripmateai.exception.BadRequestException.class, () ->
                destinationService.getOrCreateCustom("   ", "Telangana"));
    }
}

