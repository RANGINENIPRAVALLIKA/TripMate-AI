package com.tripmateai.service;

import com.tripmateai.exception.BadRequestException;
import com.tripmateai.service.impl.LocalMediaStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class MediaStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalMediaStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new LocalMediaStorageService(tempDir.toString());
    }

    @Test
    void storesValidJpegImage() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "munnar.jpg", "image/jpeg", "fake-jpeg-content".getBytes()
        );

        var result = storageService.store(file, "journal");
        assertNotNull(result);
        assertTrue(result.filename().endsWith(".jpg"));
        assertTrue(result.relativeUrl().startsWith("/api/media/journal/"));
        assertFalse(result.isVideo());

        var resource = storageService.loadAsResource(result.filename(), "journal");
        assertTrue(resource.exists());

        storageService.delete(result.filename(), "journal");
        assertThrows(com.tripmateai.exception.ResourceNotFoundException.class,
                () -> storageService.loadAsResource(result.filename(), "journal"));
    }

    @Test
    void storesValidMp4Video() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "kerala_boat.mp4", "video/mp4", "fake-mp4-video-stream".getBytes()
        );

        var result = storageService.store(file, "journal");
        assertNotNull(result);
        assertTrue(result.filename().endsWith(".mp4"));
        assertTrue(result.isVideo());
    }

    @Test
    void rejectsDisallowedFileType() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "exploit.exe", "application/x-msdownload", "executable-content".getBytes()
        );

        assertThrows(BadRequestException.class, () -> storageService.store(file, "journal"));
    }

    @Test
    void rejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]
        );

        assertThrows(BadRequestException.class, () -> storageService.store(file, "journal"));
    }
}
