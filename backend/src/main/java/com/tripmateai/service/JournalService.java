package com.tripmateai.service;

import com.tripmateai.dto.request.journal.*;
import com.tripmateai.dto.response.journal.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

public interface JournalService {
    JournalEntryDetailResponse create(Long tripId, CreateJournalEntryRequest r);
    List<JournalEntryResponse> list(Long tripId);
    JournalEntryDetailResponse get(Long tripId, Long entryId);
    JournalEntryDetailResponse update(Long tripId, Long entryId, UpdateJournalEntryRequest r);
    void delete(Long tripId, Long entryId);

    JournalPhotoResponse uploadPhoto(Long tripId, Long entryId, MultipartFile file, String caption);
    void deletePhoto(Long tripId, Long entryId, Long photoId);
    List<JournalPhotoResponse> listTripPhotos(Long tripId);
}
