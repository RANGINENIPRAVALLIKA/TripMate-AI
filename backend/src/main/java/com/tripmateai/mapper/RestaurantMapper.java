package com.tripmateai.mapper;

import com.tripmateai.dto.response.destination.RestaurantResponse;
import com.tripmateai.entity.Restaurant;

public final class RestaurantMapper {
    private RestaurantMapper() {}

    public static RestaurantResponse toResponse(Restaurant r) {
        if (r == null) return null;
        return new RestaurantResponse(
                r.getId(),
                r.getDestination() != null ? r.getDestination().getId() : null,
                r.getDestination() != null ? r.getDestination().getCity() : null,
                r.getName(),
                r.getCuisine(),
                r.getAddress(),
                r.getRating(),
                r.getImageUrl()
        );
    }
}
