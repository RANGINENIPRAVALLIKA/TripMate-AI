package com.tripmateai.service.impl;

import com.tripmateai.dto.response.destination.RestaurantResponse;
import com.tripmateai.exception.ResourceNotFoundException;
import com.tripmateai.mapper.RestaurantMapper;
import com.tripmateai.repository.RestaurantRepository;
import com.tripmateai.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Override
    public Page<RestaurantResponse> search(Long destinationId, String query, Pageable pageable) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return restaurantRepository.searchRestaurants(destinationId, cleanQuery, pageable)
                .map(RestaurantMapper::toResponse);
    }

    @Override
    public RestaurantResponse getById(Long id) {
        return restaurantRepository.findById(id)
                .map(RestaurantMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found with id: " + id));
    }
}
