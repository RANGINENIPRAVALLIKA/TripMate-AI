package com.tripmateai.mapper;

import com.tripmateai.dto.response.destination.AttractionResponse;
import com.tripmateai.entity.Attraction;

public final class AttractionMapper {
    private AttractionMapper() {}

    public static AttractionResponse toResponse(Attraction a) {
        if (a == null) return null;
        return new AttractionResponse(
                a.getId(),
                a.getDestination() != null ? a.getDestination().getId() : null,
                a.getDestination() != null ? a.getDestination().getCity() : null,
                a.getName(),
                a.getDescription(),
                a.getAddress(),
                a.getRating(),
                a.getEntryFee(),
                a.getImageUrl()
        );
    }
}
