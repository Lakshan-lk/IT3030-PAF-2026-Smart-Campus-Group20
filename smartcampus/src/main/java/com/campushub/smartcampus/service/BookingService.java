package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.BookingRequestDTO;
import com.campushub.smartcampus.dto.BookingResponseDTO;
import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.exception.BookingConflictException;
import com.campushub.smartcampus.repository.BookingRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import com.campushub.smartcampus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository, ResourceRepository resourceRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<BookingResponseDTO> getAllBookings(Pageable pageable) {
        return bookingRepository.findAll(pageable).map(BookingResponseDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));
        return BookingResponseDTO.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByResourceId(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId).stream()
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(BookingResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countByStatus(BookingStatus status) {
        return bookingRepository.findByStatus(status).size();
    }

    @Transactional(readOnly = true)
    public long countActiveBookings() {
        return bookingRepository.findByStatus(BookingStatus.APPROVED).size();
    }

    public List<BookingResponseDTO> createBooking(BookingRequestDTO dto) {
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + dto.getResourceId()));
        log.info("Resource found: id={}, name={}", resource.getId(), resource.getName());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        log.info("User found: id={}, name={}", user.getId(), user.getName());

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        if (dto.isRecurring()) {
            return createRecurringBookings(dto, resource, user);
        }

        checkForConflict(dto.getResourceId(), dto.getStartTime(), dto.getEndTime(), null);

        log.info("No conflicts found, creating booking...");
        Booking booking = BookingRequestDTO.toEntity(dto, resource, user);
        if (dto.getAttendees() != null) {
            booking.setAttendees(dto.getAttendees());
        }
        Booking saved = bookingRepository.save(booking);
        return List.of(BookingResponseDTO.fromEntity(saved));
    }

    private List<BookingResponseDTO> createRecurringBookings(BookingRequestDTO dto, Resource resource, User user) {
        LocalDate startDate = dto.getStartTime().toLocalDate();
        LocalDate endDate = dto.getRecurrenceEndDate();

        if (endDate == null || !endDate.isAfter(startDate)) {
            throw new IllegalArgumentException("Recurrence end date must be after start date");
        }

        if (dto.getRecurrencePattern() == null || !dto.getRecurrencePattern().equals("WEEKLY")) {
            throw new IllegalArgumentException("Only WEEKLY recurrence pattern is supported");
        }

        List<LocalDateTime> occurrenceStarts = new ArrayList<>();
        List<LocalDateTime> occurrenceEnds = new ArrayList<>();

        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            String currentDateStr = currentDate.toString();
            boolean shouldSkip = dto.getSkipDates() != null && dto.getSkipDates().contains(currentDateStr);

            if (!shouldSkip) {
                occurrenceStarts.add(dto.getStartTime().withDayOfMonth(currentDate.getDayOfMonth())
                        .withMonth(currentDate.getMonthValue())
                        .withYear(currentDate.getYear()));
                occurrenceEnds.add(dto.getEndTime().withDayOfMonth(currentDate.getDayOfMonth())
                        .withMonth(currentDate.getMonthValue())
                        .withYear(currentDate.getYear()));
            }
            currentDate = currentDate.plusDays(7);
        }

        if (occurrenceStarts.isEmpty()) {
            throw new IllegalArgumentException("No valid occurrences after applying skip dates");
        }

        for (int i = 0; i < occurrenceStarts.size(); i++) {
            checkForConflict(dto.getResourceId(), occurrenceStarts.get(i), occurrenceEnds.get(i), null);
        }

        String groupId = UUID.randomUUID().toString();
        String skipDatesStr = dto.getSkipDates() != null ? String.join(",", dto.getSkipDates()) : null;

        List<BookingResponseDTO> results = new ArrayList<>();
        for (int i = 0; i < occurrenceStarts.size(); i++) {
            Booking booking = new Booking();
            booking.setResource(resource);
            booking.setUser(user);
            booking.setPurpose(dto.getPurpose());
            booking.setAttendees(dto.getAttendees());
            booking.setStartTime(occurrenceStarts.get(i));
            booking.setEndTime(occurrenceEnds.get(i));
            booking.setStatus(BookingStatus.PENDING);
            booking.setRecurring(true);
            booking.setRecurrenceGroupId(groupId);
            booking.setRecurrencePattern("WEEKLY");
            booking.setRecurrenceEndDate(endDate);
            booking.setSkipDates(skipDatesStr);

            Booking saved = bookingRepository.save(booking);
            results.add(BookingResponseDTO.fromEntity(saved));
        }

        return results;
    }

    public BookingResponseDTO updateBooking(Long id, BookingRequestDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        checkForConflict(dto.getResourceId(), dto.getStartTime(), dto.getEndTime(), id);

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + dto.getResourceId()));

        booking.setResource(resource);
        booking.setPurpose(dto.getPurpose());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());

        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public BookingResponseDTO approveBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public BookingResponseDTO rejectBooking(Long id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Cannot cancel a booking that is already " + booking.getStatus());
        }

        if (booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot cancel a booking that has already started");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public int cancelSeries(String groupId) {
        List<Booking> bookings = bookingRepository.findByRecurrenceGroupId(groupId);

        int cancelledCount = 0;
        for (Booking booking : bookings) {
            if ((booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.APPROVED)
                    && booking.getStartTime().isAfter(LocalDateTime.now())) {
                booking.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(booking);
                cancelledCount++;
            }
        }

        return cancelledCount;
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new EntityNotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    private void checkForConflict(Long resourceId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(
                resourceId, endTime, startTime);

        Booking conflict = conflicts.stream()
                .filter(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId))
                .findFirst()
                .orElse(null);

        if (conflict != null) {
            log.warn("Conflict found: {}", conflict.getStartTime() + " to " + conflict.getEndTime());
            throw new BookingConflictException(
                    "Resource '" + conflict.getResource().getName() + "' is already booked from "
                    + conflict.getStartTime() + " to " + conflict.getEndTime());
        }
        log.info("No conflicts found in checkForConflict");
    }
}
