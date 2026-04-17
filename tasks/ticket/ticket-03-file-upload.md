# Task ticket-03 — Ticket File Upload + Static File Serving

## Goal
Add a multipart upload endpoint for ticket attachments (max 3 images per ticket) and serve uploaded files via a static URL.

## Prerequisite
ticket-02

## Context
- `application.properties` — `app.upload-dir=uploads` and multipart max sizes already set (10MB)
- `TicketAttachmentRepository` and `Ticket` entity from ticket-01
- `TicketService` from ticket-02 — add `addAttachments` method
- `WebConfig` at `com.campushub.smartcampus.config.WebConfig` — extend to serve `/uploads/**`
- Attachment limit: 3 files per ticket, enforced in service

## What to build
- `service/TicketService.java` (modify) — add `addAttachments(Long ticketId, List<MultipartFile> files)`
- `controller/TicketController.java` (modify) — add `POST /{id}/attachments`
- `config/WebConfig.java` (modify) — add static resource handler for `/uploads/**`

## Steps
1. In `WebConfig` (which likely implements `WebMvcConfigurer`), add:
   ```java
   @Override
   public void addResourceHandlers(ResourceHandlerRegistry registry) {
       registry.addResourceHandler("/uploads/**")
               .addResourceLocations("file:uploads/");
   }
   ```
2. In `TicketService.addAttachments(Long ticketId, List<MultipartFile> files)`:
   a. Load ticket — throw EntityNotFoundException if missing.
   b. Check current attachment count: `attachmentRepository.countByTicketId(ticketId)` + `files.size()` must be ≤ 3. Throw `IllegalStateException("Maximum 3 attachments allowed")` if over.
   c. Validate each file: `contentType` must start with "image/". Reject otherwise.
   d. For each file:
      - Generate unique filename: `UUID.randomUUID() + "_" + originalFilename`
      - Resolve path: `Paths.get(uploadDir).resolve(uniqueFilename)` where `@Value("${app.upload-dir}") String uploadDir`
      - Create dirs if missing: `Files.createDirectories(path.getParent())`
      - Write bytes: `Files.write(path, file.getBytes())`
      - Save `TicketAttachment` entity: `fileName=originalFilename`, `filePath=uniqueFilename`, `contentType=file.getContentType()`
   e. Return updated `TicketResponseDTO` with all attachments.
3. In `TicketController`, add:
   ```
   POST /api/v1/tickets/{id}/attachments
   consumes = multipart/form-data
   @RequestParam("files") List<MultipartFile> files
   → 200 TicketResponseDTO
   ```
4. The served URL for a file is `http://localhost:8080/uploads/<filePath>`. AttachmentDTO.url = `/uploads/<filePath>`.

## Verification
```bash
# Upload an image to ticket id=1
curl -X POST http://localhost:8080/api/v1/tickets/1/attachments \
  -F "files=@/path/to/broken_projector.jpg"
# → response includes attachments array with url: /uploads/<uuid>_broken_projector.jpg

# Fetch the file directly
curl http://localhost:8080/uploads/<uuid>_broken_projector.jpg --output test.jpg
# → valid image file
```

## When done
Mark `- [x] ticket/ticket-03` in `tasks/PROGRESS.md`.
