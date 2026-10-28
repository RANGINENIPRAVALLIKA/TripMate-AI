package com.tripmateai.dto.response.destination;

import java.math.BigDecimal;

public record HotelResponse(
        Long id,
        Long destinationId,
        String destinationCity,
        String name,
        String address,
        BigDecimal rating,
        BigDecimal pricePerNight,
        String imageUrl
) {}
