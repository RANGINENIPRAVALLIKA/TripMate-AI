package com.tripmateai.controller;

import com.tripmateai.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaStorageService mediaStorageService;

    @GetMapping("/{subfolder}/{filename:.+}")
    public ResponseEntity<Resource> serveMedia(
            @PathVariable String subfolder,
            @PathVariable String filename
    ) {
        Resource resource = mediaStorageService.loadAsResource(filename, subfolder);

        String contentType = null;
        try {
            contentType = Files.probeContentType(Paths.get(resource.getFile().getAbsolutePath()));
        } catch (IOException ex) {
            log.debug("Could not probe content type for {}", filename);
        }

        if (contentType == null) {
            String lower = filename.toLowerCase();
            if (lower.endsWith(".mp4")) contentType = "video/mp4";
            else if (lower.endsWith(".webm")) contentType = "video/webm";
            else if (lower.endsWith(".png")) contentType = "image/png";
            else if (lower.endsWith(".webp")) contentType = "image/webp";
            else contentType = "image/jpeg";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "max-age=86400, public")
                .body(resource);
    }
}
