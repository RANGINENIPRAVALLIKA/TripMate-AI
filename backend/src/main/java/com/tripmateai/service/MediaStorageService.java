package com.tripmateai.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface MediaStorageService {

    StoredMedia store(MultipartFile file, String subfolder);

    Resource loadAsResource(String filename, String subfolder);

    void delete(String filename, String subfolder);

    record StoredMedia(String filename, String relativeUrl, String contentType, long sizeBytes, boolean isVideo) {}
}
