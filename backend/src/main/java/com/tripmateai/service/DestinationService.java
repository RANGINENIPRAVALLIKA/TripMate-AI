package com.tripmateai.service;

import com.tripmateai.dto.response.destination.DestinationResponse;
import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.dto.response.destination.RestaurantResponse;
import com.tripmateai.dto.response.destination.AttractionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DestinationService {
    Page<DestinationResponse> search(String query, String country, String state, String bestSeason, Pageable pageable);
    List<DestinationResponse> listAll();
    DestinationResponse getById(Long id);
    List<HotelResponse> getHotels(Long id);
    List<RestaurantResponse> getRestaurants(Long id);
    List<AttractionResponse> getAttractions(Long id);
    DestinationResponse getOrCreateCustom(String city, String state);
}
