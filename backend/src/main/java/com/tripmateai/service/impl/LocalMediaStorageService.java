package com.tripmateai.service.impl;

import com.tripmateai.exception.BadRequestException;
import com.tripmateai.exception.ResourceNotFoundException;
import com.tripmateai.service.MediaStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class LocalMediaStorageService implements MediaStorageService {

    private static final long MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB
    private static final long MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60MB

    private static final Map<String, String> ALLOWED_IMAGE_MIME = Map.of(
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private static final Map<String, String> ALLOWED_VIDEO_MIME = Map.of(
            "video/mp4", ".mp4",
            "video/webm", ".webm"
    );

    private static final Set<String> ALLOWED_IMAGE_EXTS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Set<String> ALLOWED_VIDEO_EXTS = Set.of(".mp4", ".webm");

    private final Path rootLocation;

    public LocalMediaStorageService(@Value("${app.media.upload-dir:uploads/media}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize local storage directory: {}", this.rootLocation, e);
            throw new RuntimeException("Could not initialize media storage location", e);
        }
    }

    @Override
    public StoredMedia store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalFilename.contains("..")) {
            throw new BadRequestException("Cannot store file with relative path outside directory: " + originalFilename);
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new BadRequestException("Content type could not be determined");
        }
        contentType = contentType.toLowerCase(Locale.ROOT);

        String rawExt = "";
        int dotIdx = originalFilename.lastIndexOf('.');
        if (dotIdx >= 0) {
            rawExt = originalFilename.substring(dotIdx).toLowerCase(Locale.ROOT);
        }

        boolean isImage = ALLOWED_IMAGE_MIME.containsKey(contentType) || ALLOWED_IMAGE_EXTS.contains(rawExt);
        boolean isVideo = ALLOWED_VIDEO_MIME.containsKey(contentType) || ALLOWED_VIDEO_EXTS.contains(rawExt);

        if (!isImage && !isVideo) {
            throw new BadRequestException("Unsupported media type. Allowed formats: JPG, PNG, WEBP, MP4, WEBM");
        }

        long fileSize = file.getSize();
        if (isImage && fileSize > MAX_IMAGE_SIZE) {
            throw new BadRequestException("Image file size exceeds maximum limit of 15MB");
        }
        if (isVideo && fileSize > MAX_VIDEO_SIZE) {
            throw new BadRequestException("Video file size exceeds maximum limit of 60MB");
        }

        String extension = isVideo
                ? (ALLOWED_VIDEO_EXTS.contains(rawExt) ? rawExt : ALLOWED_VIDEO_MIME.getOrDefault(contentType, ".mp4"))
                : (ALLOWED_IMAGE_EXTS.contains(rawExt) ? (rawExt.equals(".jpeg") ? ".jpg" : rawExt) : ALLOWED_IMAGE_MIME.getOrDefault(contentType, ".jpg"));

        String safeFilename = UUID.randomUUID().toString() + extension;
        String cleanSubfolder = sanitizeSubfolder(subfolder);
        Path targetDir = this.rootLocation.resolve(cleanSubfolder).normalize();

        try {
            Files.createDirectories(targetDir);
            Path destinationFile = targetDir.resolve(safeFilename).normalize();
            if (!destinationFile.startsWith(this.rootLocation)) {
                throw new BadRequestException("Cannot store file outside current storage directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativeUrl = "/api/media/" + cleanSubfolder + "/" + safeFilename;
            return new StoredMedia(safeFilename, relativeUrl, contentType, fileSize, isVideo);
        } catch (IOException e) {
            log.error("Failed to store media file: {}", safeFilename, e);
            throw new BadRequestException("Failed to store media file: " + e.getMessage());
        }
    }

    @Override
    public Resource loadAsResource(String filename, String subfolder) {
        try {
            String cleanSubfolder = sanitizeSubfolder(subfolder);
            Path filePath = this.rootLocation.resolve(cleanSubfolder).resolve(filename).normalize();
            if (!filePath.startsWith(this.rootLocation)) {
                throw new BadRequestException("Path traversal attempt detected");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Media file not found: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Media file not found: " + filename);
        }
    }

    @Override
    public void delete(String filename, String subfolder) {
        try {
            String cleanSubfolder = sanitizeSubfolder(subfolder);
            Path filePath = this.rootLocation.resolve(cleanSubfolder).resolve(filename).normalize();
            if (filePath.startsWith(this.rootLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete stored media file {}: {}", filename, e.getMessage());
        }
    }

    private String sanitizeSubfolder(String subfolder) {
        if (subfolder == null || subfolder.isBlank()) {
            return "general";
        }
        return subfolder.replaceAll("[^a-zA-Z0-9_-]", "");
    }
}
