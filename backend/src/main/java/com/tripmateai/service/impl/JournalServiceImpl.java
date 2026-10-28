package com.tripmateai.service.impl;

import com.tripmateai.dto.request.journal.*;
import com.tripmateai.dto.response.journal.*;
import com.tripmateai.entity.*;
import com.tripmateai.exception.*;
import com.tripmateai.mapper.JournalMapper;
import com.tripmateai.repository.*;
import com.tripmateai.security.UserPrincipal;
import com.tripmateai.service.JournalService;
import com.tripmateai.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class JournalServiceImpl implements JournalService {

    private final TripRepository trips;
    private final TravelJournalRepository journals;
    private final JournalPhotoRepository photos;
    private final MediaStorageService mediaStorageService;

    private User user() {
        var p = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(p instanceof UserPrincipal u)) throw new UnauthorizedException("Authentication required");
        return u.user();
    }

    private Trip trip(Long id) {
        return trips.findByIdAndUser(id, user())
                .orElseThrow(() -> trips.existsById(id)
                        ? new UnauthorizedException("You do not own this trip")
                        : new ResourceNotFoundException("Trip not found"));
    }

    private TravelJournal entry(Long tripId, Long id) {
        return journals.findByIdAndTrip(id, trip(tripId))
                .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found"));
    }

    private JournalEntryDetailResponse detail(TravelJournal j) {
        return JournalMapper.detail(j, photos.findByJournalOrderBySortOrderAsc(j));
    }

    @Override
    public JournalEntryDetailResponse create(Long id, CreateJournalEntryRequest r) {
        var j = new TravelJournal();
        j.setTrip(trip(id));
        j.setUser(user());
        j.setJournalDate(r.journalDate());
        j.setTitle(r.title());
        j.setContent(r.content());
        return detail(journals.save(j));
    }

    @Override
    @Transactional(readOnly = true)
    public List<JournalEntryResponse> list(Long id) {
        return journals.findByTripOrderByJournalDateDesc(trip(id)).stream()
                .map(JournalMapper::summary)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public JournalEntryDetailResponse get(Long t, Long id) {
        return detail(entry(t, id));
    }

    @Override
    public JournalEntryDetailResponse update(Long t, Long id, UpdateJournalEntryRequest r) {
        var j = entry(t, id);
        j.setJournalDate(r.journalDate());
        j.setTitle(r.title());
        j.setContent(r.content());
        return detail(journals.save(j));
    }

    @Override
    public void delete(Long t, Long id) {
        var j = entry(t, id);
        // Clean up media files
        List<JournalPhoto> attachedPhotos = photos.findByJournalOrderBySortOrderAsc(j);
        for (JournalPhoto photo : attachedPhotos) {
            String url = photo.getImageUrl();
            int idx = url.lastIndexOf('/');
            if (idx >= 0) {
                mediaStorageService.delete(url.substring(idx + 1), "journal");
            }
        }
        journals.delete(j);
    }

    @Override
    public JournalPhotoResponse uploadPhoto(Long tripId, Long entryId, MultipartFile file, String caption) {
        var j = entry(tripId, entryId);
        var stored = mediaStorageService.store(file, "journal");

        int currentCount = photos.findByJournalOrderBySortOrderAsc(j).size();
        JournalPhoto photo = new JournalPhoto();
        photo.setJournal(j);
        photo.setImageUrl(stored.relativeUrl());
        photo.setCaption(caption == null || caption.isBlank()
                ? (stored.isVideo() ? "Travel Video Clip" : "Trip Memory")
                : caption.trim());
        photo.setSortOrder(currentCount + 1);
        photo = photos.save(photo);

        return new JournalPhotoResponse(photo.getId(), photo.getImageUrl(), photo.getCaption(), photo.getSortOrder());
    }

    @Override
    public void deletePhoto(Long tripId, Long entryId, Long photoId) {
        var j = entry(tripId, entryId);
        var photo = photos.findByIdAndJournal(photoId, j)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found in this entry"));

        String url = photo.getImageUrl();
        int idx = url.lastIndexOf('/');
        if (idx >= 0) {
            mediaStorageService.delete(url.substring(idx + 1), "journal");
        }
        photos.delete(photo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<JournalPhotoResponse> listTripPhotos(Long tripId) {
        var t = trip(tripId);
        return photos.findByJournalTripOrderByCreatedAtDesc(t).stream()
                .map(p -> new JournalPhotoResponse(p.getId(), p.getImageUrl(), p.getCaption(), p.getSortOrder()))
                .toList();
    }
}
