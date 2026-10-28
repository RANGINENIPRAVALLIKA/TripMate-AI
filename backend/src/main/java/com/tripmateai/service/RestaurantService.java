package com.tripmateai.service;

import com.tripmateai.dto.response.destination.RestaurantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RestaurantService {
    Page<RestaurantResponse> search(Long destinationId, String query, Pageable pageable);
    RestaurantResponse getById(Long id);
}
