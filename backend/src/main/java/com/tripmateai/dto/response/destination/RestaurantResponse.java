package com.tripmateai.dto.response.destination;

import java.math.BigDecimal;

public record RestaurantResponse(
        Long id,
        Long destinationId,
        String destinationCity,
        String name,
        String cuisine,
        String address,
        BigDecimal rating,
        String imageUrl
) {}
