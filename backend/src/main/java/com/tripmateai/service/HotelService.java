package com.tripmateai.service;

import com.tripmateai.dto.response.destination.HotelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface HotelService {
    Page<HotelResponse> search(Long destinationId, String query, Pageable pageable);
    HotelResponse getById(Long id);
}
