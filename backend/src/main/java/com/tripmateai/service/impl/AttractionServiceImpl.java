package com.tripmateai.service.impl;

import com.tripmateai.dto.response.destination.AttractionResponse;
import com.tripmateai.exception.ResourceNotFoundException;
import com.tripmateai.mapper.AttractionMapper;
import com.tripmateai.repository.AttractionRepository;
import com.tripmateai.service.AttractionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttractionServiceImpl implements AttractionService {

    private final AttractionRepository attractionRepository;

    @Override
    public Page<AttractionResponse> search(Long destinationId, String query, Pageable pageable) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return attractionRepository.searchAttractions(destinationId, cleanQuery, pageable)
                .map(AttractionMapper::toResponse);
    }

    @Override
    public AttractionResponse getById(Long id) {
        return attractionRepository.findById(id)
                .map(AttractionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Attraction not found with id: " + id));
    }
}
