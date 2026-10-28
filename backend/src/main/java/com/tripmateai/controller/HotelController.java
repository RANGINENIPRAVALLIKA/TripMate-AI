package com.tripmateai.controller;

import com.tripmateai.dto.response.ApiResponse;
import com.tripmateai.dto.response.destination.HotelResponse;
import com.tripmateai.service.HotelService;
import com.tripmateai.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HotelResponse>>> list(
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<HotelResponse> result = service.search(destinationId, q, PageRequest.of(page, size, sort));
        return ResponseUtils.success(result, "Hotels retrieved");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HotelResponse>> get(@PathVariable Long id) {
        return ResponseUtils.success(service.getById(id), "Hotel retrieved");
    }
}
