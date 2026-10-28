package com.tripmateai.service.impl;

import com.tripmateai.dto.response.destination.DestinationResponse;
import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.dto.response.destination.RestaurantResponse;
import com.tripmateai.dto.response.destination.AttractionResponse;
import com.tripmateai.exception.ResourceNotFoundException;
import com.tripmateai.mapper.DestinationMapper;
import com.tripmateai.mapper.HotelMapper;
import com.tripmateai.mapper.RestaurantMapper;
import com.tripmateai.mapper.AttractionMapper;
import com.tripmateai.repository.DestinationRepository;
import com.tripmateai.repository.HotelRepository;
import com.tripmateai.repository.RestaurantRepository;
import com.tripmateai.repository.AttractionRepository;
import com.tripmateai.service.DestinationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DestinationServiceImpl implements DestinationService {

    private final DestinationRepository destinationRepository;
    private final HotelRepository hotelRepository;
    private final RestaurantRepository restaurantRepository;
    private final AttractionRepository attractionRepository;

    @Override
    public Page<DestinationResponse> search(String query, String country, String state, String bestSeason, Pageable pageable) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        String cleanCountry = (country != null && !country.isBlank()) ? country.trim() : null;
        String cleanState = (state != null && !state.isBlank()) ? state.trim() : null;
        String cleanSeason = (bestSeason != null && !bestSeason.isBlank()) ? bestSeason.trim() : null;
        return destinationRepository.searchDestinations(cleanQuery, cleanCountry, cleanState, cleanSeason, pageable)
                .map(DestinationMapper::toResponse);
    }

    @Override
    public List<DestinationResponse> listAll() {
        return destinationRepository.findAllByOrderByCityAsc().stream()
                .map(DestinationMapper::toResponse)
                .toList();
    }

    @Override
    public DestinationResponse getById(Long id) {
        return destinationRepository.findById(id)
                .map(DestinationMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Destination not found with id: " + id));
    }

    @Override
    public List<HotelResponse> getHotels(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found with id: " + id);
        }
        return hotelRepository.findByDestinationId(id).stream()
                .map(HotelMapper::toResponse)
                .toList();
    }

    @Override
    public List<RestaurantResponse> getRestaurants(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found with id: " + id);
        }
        return restaurantRepository.findByDestinationId(id).stream()
                .map(RestaurantMapper::toResponse)
                .toList();
    }

    @Override
    public List<AttractionResponse> getAttractions(Long id) {
        if (!destinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Destination not found with id: " + id);
        }
        return attractionRepository.findByDestinationId(id).stream()
                .map(AttractionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public DestinationResponse getOrCreateCustom(String city, String state) {
        if (city == null || city.trim().isBlank()) {
            throw new com.tripmateai.exception.BadRequestException("Destination city or name cannot be blank");
        }
        String cleanCity = city.trim();
        String cleanState = (state != null && !state.trim().isBlank()) ? state.trim() : null;

        return destinationRepository.findByCityIgnoreCase(cleanCity)
                .map(DestinationMapper::toResponse)
                .orElseGet(() -> {
                    com.tripmateai.entity.Destination d = new com.tripmateai.entity.Destination();
                    d.setCity(cleanCity);
                    d.setState(cleanState);
                    d.setCountry("India");
                    d.setDescription("Traveler destination in India: " + cleanCity + (cleanState != null ? ", " + cleanState : ""));
                    d.setImageUrl("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80");
                    d.setBestSeason("Year-round");
                    d.setAverageBudget(new java.math.BigDecimal("15000.00"));
                    d.setLatitude(new java.math.BigDecimal("20.5937"));
                    d.setLongitude(new java.math.BigDecimal("78.9629"));
                    return DestinationMapper.toResponse(destinationRepository.save(d));
                });
    }
}

