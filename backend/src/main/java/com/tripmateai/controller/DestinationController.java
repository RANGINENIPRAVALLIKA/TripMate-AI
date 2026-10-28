package com.tripmateai.controller;

import com.tripmateai.dto.request.destination.CustomDestinationRequest;
import com.tripmateai.dto.response.ApiResponse;
import com.tripmateai.dto.response.destination.DestinationResponse;
import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.dto.response.destination.RestaurantResponse;
import com.tripmateai.dto.response.destination.AttractionResponse;
import com.tripmateai.service.DestinationService;
import com.tripmateai.util.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/destinations")
@RequiredArgsConstructor
public class DestinationController {

    private final DestinationService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DestinationResponse>>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String bestSeason,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "city") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<DestinationResponse> result = service.search(q, country, state, bestSeason, PageRequest.of(page, size, sort));
        return ResponseUtils.success(result, "Destinations retrieved");
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<DestinationResponse>>> all() {
        return ResponseUtils.success(service.listAll(), "All destinations retrieved");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DestinationResponse>> get(@PathVariable Long id) {
        return ResponseUtils.success(service.getById(id), "Destination retrieved");
    }

    @GetMapping("/{id}/hotels")
    public ResponseEntity<ApiResponse<List<HotelResponse>>> hotels(@PathVariable Long id) {
        return ResponseUtils.success(service.getHotels(id), "Destination hotels retrieved");
    }

    @GetMapping("/{id}/restaurants")
    public ResponseEntity<ApiResponse<List<RestaurantResponse>>> restaurants(@PathVariable Long id) {
        return ResponseUtils.success(service.getRestaurants(id), "Destination restaurants retrieved");
    }

    @GetMapping("/{id}/attractions")
    public ResponseEntity<ApiResponse<List<AttractionResponse>>> attractions(@PathVariable Long id) {
        return ResponseUtils.success(service.getAttractions(id), "Destination attractions retrieved");
    }

    @PostMapping("/custom")
    public ResponseEntity<ApiResponse<DestinationResponse>> createCustom(@Valid @RequestBody CustomDestinationRequest request) {
        DestinationResponse response = service.getOrCreateCustom(request.city(), request.state());
        return ResponseUtils.success(response, "Destination ready for trip planning");
    }
}

