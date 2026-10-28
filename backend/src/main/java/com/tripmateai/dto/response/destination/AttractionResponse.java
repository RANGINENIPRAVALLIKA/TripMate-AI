package com.tripmateai.dto.response.destination;

import java.math.BigDecimal;

public record AttractionResponse(
        Long id,
        Long destinationId,
        String destinationCity,
        String name,
        String description,
        String address,
        BigDecimal rating,
        BigDecimal entryFee,
        String imageUrl
) {}
