package com.campushub.smartcampus.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
public class ResourceImageService {

    private final Path uploadRoot;
    private final Path resourceImageDir;

    public ResourceImageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.resourceImageDir = this.uploadRoot.resolve("resources");
    }

    @PostConstruct
    public void initDirectories() throws IOException {
        Files.createDirectories(uploadRoot);
        Files.createDirectories(resourceImageDir);
    }

    public String storeResourceImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "image"));
        String extension = StringUtils.getFilenameExtension(originalFilename);
        String fileName = UUID.randomUUID() + (extension != null && !extension.isBlank() ? "." + extension : "");

        Path target = resourceImageDir.resolve(fileName).normalize();
        if (!target.startsWith(resourceImageDir)) {
            throw new IllegalArgumentException("Invalid image file name");
        }

        file.transferTo(target);
        return "/uploads/resources/" + fileName;
    }

    public void deleteResourceImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.startsWith("/uploads/")) {
            return;
        }

        String relativePath = imageUrl.substring("/uploads/".length());
        Path target = uploadRoot.resolve(relativePath).normalize();
        if (!target.startsWith(uploadRoot)) {
            return;
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // Best-effort cleanup; keep the resource update/delete flow working.
        }
    }
}
