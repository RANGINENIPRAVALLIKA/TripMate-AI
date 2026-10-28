package com.tripmateai.controller;

import com.tripmateai.dto.response.ApiResponse;
import com.tripmateai.dto.response.destination.AttractionResponse;
import com.tripmateai.service.AttractionService;
import com.tripmateai.util.ResponseUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attractions")
@RequiredArgsConstructor
public class AttractionController {

    private final AttractionService service;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AttractionResponse>>> list(
            @RequestParam(required = false) Long destinationId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Page<AttractionResponse> result = service.search(destinationId, q, PageRequest.of(page, size, sort));
        return ResponseUtils.success(result, "Attractions retrieved");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AttractionResponse>> get(@PathVariable Long id) {
        return ResponseUtils.success(service.getById(id), "Attraction retrieved");
    }
}
