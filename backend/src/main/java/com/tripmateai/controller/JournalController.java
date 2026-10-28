package com.tripmateai.controller;

import com.tripmateai.dto.request.journal.*;
import com.tripmateai.dto.response.*;
import com.tripmateai.dto.response.journal.*;
import com.tripmateai.service.JournalService;
import com.tripmateai.util.ResponseUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/trips/{tripId}/journal")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService service;

    @PostMapping
    public ResponseEntity<ApiResponse<JournalEntryDetailResponse>> create(
            @PathVariable Long tripId,
            @Valid @RequestBody CreateJournalEntryRequest r
    ) {
        return ResponseUtils.created(service.create(tripId, r), "Journal entry created");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JournalEntryResponse>>> list(@PathVariable Long tripId) {
        return ResponseUtils.success(service.list(tripId), "Journal entries retrieved");
    }

    @GetMapping("/{entryId}")
    public ResponseEntity<ApiResponse<JournalEntryDetailResponse>> get(
            @PathVariable Long tripId,
            @PathVariable Long entryId
    ) {
        return ResponseUtils.success(service.get(tripId, entryId), "Journal entry retrieved");
    }

    @PutMapping("/{entryId}")
    public ResponseEntity<ApiResponse<JournalEntryDetailResponse>> update(
            @PathVariable Long tripId,
            @PathVariable Long entryId,
            @Valid @RequestBody UpdateJournalEntryRequest r
    ) {
        return ResponseUtils.success(service.update(tripId, entryId, r), "Journal entry updated");
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long tripId,
            @PathVariable Long entryId
    ) {
        service.delete(tripId, entryId);
        return ResponseUtils.success(null, "Journal entry deleted");
    }

    @PostMapping(value = "/{entryId}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<JournalPhotoResponse>> uploadMedia(
            @PathVariable Long tripId,
            @PathVariable Long entryId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption
    ) {
        JournalPhotoResponse response = service.uploadPhoto(tripId, entryId, file, caption);
        return ResponseUtils.created(response, "Media uploaded successfully");
    }

    @DeleteMapping("/{entryId}/photos/{photoId}")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(
            @PathVariable Long tripId,
            @PathVariable Long entryId,
            @PathVariable Long photoId
    ) {
        service.deletePhoto(tripId, entryId, photoId);
        return ResponseUtils.success(null, "Media deleted successfully");
    }

    @GetMapping("/media")
    public ResponseEntity<ApiResponse<List<JournalPhotoResponse>>> listTripMedia(
            @PathVariable Long tripId
    ) {
        return ResponseUtils.success(service.listTripPhotos(tripId), "Trip media retrieved");
    }
}
