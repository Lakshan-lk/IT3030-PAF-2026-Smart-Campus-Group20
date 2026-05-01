package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.AttachmentDTO;
import com.campushub.smartcampus.entity.Ticket;
import com.campushub.smartcampus.entity.TicketAttachment;
import com.campushub.smartcampus.repository.TicketAttachmentRepository;
import com.campushub.smartcampus.repository.TicketRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class TicketAttachmentService {

    private static final Set<String> IMAGE_EXTENSIONS = Set.of("png", "jpg", "jpeg", "gif", "webp", "svg");
    private static final int MAX_ATTACHMENTS = 3;

    private final Path uploadRoot;
    private final TicketRepository ticketRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;

    public TicketAttachmentService(@Value("${app.upload-dir:uploads}") String uploadDir,
                                   TicketRepository ticketRepository,
                                   TicketAttachmentRepository ticketAttachmentRepository) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.ticketRepository = ticketRepository;
        this.ticketAttachmentRepository = ticketAttachmentRepository;
    }

    public List<AttachmentDTO> addAttachments(Long ticketId, List<MultipartFile> files) throws IOException {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("At least one image is required");
        }

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new EntityNotFoundException("Ticket not found with id: " + ticketId));

        long existingCount = ticketAttachmentRepository.countByTicketId(ticketId);
        if (existingCount + files.size() > MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("A ticket can have up to 3 images");
        }

        List<AttachmentDTO> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            TicketAttachment attachment = storeAttachment(ticket, file);
            TicketAttachment persisted = ticketAttachmentRepository.save(attachment);
            saved.add(AttachmentDTO.fromEntity(persisted));
        }

        return saved;
    }

    public void deleteAttachments(Long ticketId) {
        List<TicketAttachment> attachments = ticketAttachmentRepository.findByTicketId(ticketId);
        for (TicketAttachment attachment : attachments) {
            deleteFile(attachment.getFilePath());
            ticketAttachmentRepository.delete(attachment);
        }
    }

    private TicketAttachment storeAttachment(Ticket ticket, MultipartFile file) throws IOException {
        validateImage(file);

        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String extension = extractExtension(originalName);

        Path ticketDir = uploadRoot.resolve("tickets").resolve(String.valueOf(ticket.getId()));
        Files.createDirectories(ticketDir);

        String storedFileName = UUID.randomUUID() + "." + extension;
        Path destination = ticketDir.resolve(storedFileName).normalize();
        if (!destination.startsWith(ticketDir)) {
            throw new IllegalArgumentException("Invalid attachment path");
        }

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        TicketAttachment attachment = new TicketAttachment();
        attachment.setTicket(ticket);
        attachment.setFileName(originalName);
        attachment.setFilePath("tickets/" + ticket.getId() + "/" + storedFileName);
        attachment.setContentType(file.getContentType());
        return attachment;
    }

    private void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            return;
        }

        Path resolved = uploadRoot.resolve(relativePath).normalize();
        if (!resolved.startsWith(uploadRoot)) {
            return;
        }

        try {
            Files.deleteIfExists(resolved);
        } catch (IOException ignored) {
            // Best-effort cleanup only.
        }
    }

    private void validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file is required");
        }

        String originalName = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = extractExtension(originalName);
        if (!IMAGE_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Unsupported image type. Allowed: png, jpg, jpeg, gif, webp, svg");
        }
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new IllegalArgumentException("Image file must have a valid extension");
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
