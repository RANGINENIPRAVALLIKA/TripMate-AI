package com.tripmateai.service;

import com.tripmateai.dto.response.destination.AttractionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AttractionService {
    Page<AttractionResponse> search(Long destinationId, String query, Pageable pageable);
    AttractionResponse getById(Long id);
}
