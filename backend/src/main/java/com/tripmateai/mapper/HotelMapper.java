package com.tripmateai.mapper;

import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.entity.Hotel;

public final class HotelMapper {
    private HotelMapper() {}

    public static HotelResponse toResponse(Hotel h) {
        if (h == null) return null;
        return new HotelResponse(
                h.getId(),
                h.getDestination() != null ? h.getDestination().getId() : null,
                h.getDestination() != null ? h.getDestination().getCity() : null,
                h.getName(),
                h.getAddress(),
                h.getRating(),
                h.getPricePerNight(),
                h.getImageUrl()
        );
    }
}
