package com.campushub.smartcampus.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ResourceImageService {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "gif", "webp", "svg");

    private final Path uploadRoot;

    public ResourceImageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    public String saveResourceImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extractExtension(originalName);
        if (!IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported image type. Allowed: png, jpg, jpeg, gif, webp, svg");
        }

        Path imageDir = uploadRoot.resolve("resources");
        Files.createDirectories(imageDir);

        String storedFileName = UUID.randomUUID() + "." + extension;
        Path destination = imageDir.resolve(storedFileName).normalize();
        if (!destination.startsWith(imageDir)) {
            throw new IllegalArgumentException("Invalid image path");
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/resources/" + storedFileName;
    }

    public void deleteUploadedImage(String imageUrl) {
        if (!isManagedUpload(imageUrl)) {
            return;
        }

        Path filePath = resolveImagePath(imageUrl);
        if (filePath == null) {
            return;
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException ignored) {
            // Best-effort cleanup only.
        }
    }

    public boolean isManagedUpload(String imageUrl) {
        return imageUrl != null && imageUrl.startsWith("/uploads/");
    }

    private Path resolveImagePath(String imageUrl) {
        if (!isManagedUpload(imageUrl)) {
            return null;
        }

        String relativePath = imageUrl.substring("/uploads/".length());
        Path resolved = uploadRoot.resolve(relativePath).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            return null;
        }
        return resolved;
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException("Image file must have a valid extension");
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
