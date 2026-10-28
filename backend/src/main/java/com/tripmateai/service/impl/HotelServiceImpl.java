package com.tripmateai.service.impl;

import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.exception.ResourceNotFoundException;
import com.tripmateai.mapper.HotelMapper;
import com.tripmateai.repository.HotelRepository;
import com.tripmateai.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    @Override
    public Page<HotelResponse> search(Long destinationId, String query, Pageable pageable) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return hotelRepository.searchHotels(destinationId, cleanQuery, pageable)
                .map(HotelMapper::toResponse);
    }

    @Override
    public HotelResponse getById(Long id) {
        return hotelRepository.findById(id)
                .map(HotelMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found with id: " + id));
    }
}
