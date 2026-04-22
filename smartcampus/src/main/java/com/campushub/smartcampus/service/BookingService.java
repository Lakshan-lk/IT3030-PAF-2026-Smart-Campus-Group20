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
import java.time.format.DateTimeFormatter;
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

    public BookingResponseDTO createBooking(BookingRequestDTO dto) {
        log.info("createBooking called - resourceId={}, userId={}, start={}, end={}, attendees={}",
                dto.getResourceId(), dto.getUserId(), dto.getStartTime(), dto.getEndTime(), dto.getAttendees());

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + dto.getResourceId()));
        log.info("Resource found: id={}, name={}", resource.getId(), resource.getName());

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));
        log.info("User found: id={}, name={}", user.getId(), user.getName());

        if (dto.getRecurring() != null && dto.getRecurring() && dto.getRecurrenceEndDate() != null) {
            return createRecurringBooking(dto, resource, user);
        }

        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        log.info("Checking conflicts for resourceId={} from {} to {}", dto.getResourceId(), dto.getStartTime(), dto.getEndTime());
        checkForConflict(dto.getResourceId(), dto.getStartTime(), dto.getEndTime(), null);

        log.info("No conflicts found, creating booking...");
        Booking booking = BookingRequestDTO.toEntity(dto, resource, user);
        if (dto.getAttendees() != null) {
            booking.setAttendees(dto.getAttendees());
        }
        Booking saved = bookingRepository.save(booking);
        log.info("Booking saved with id={}", saved.getId());

        BookingResponseDTO response = BookingResponseDTO.fromEntity(saved);
        log.info("Response DTO created, returning to controller");
        return response;
    }

    private BookingResponseDTO createRecurringBooking(BookingRequestDTO dto, Resource resource, User user) {
        List<LocalDateTime> bookingDates = generateRecurringDates(dto);

        final List<String> skipDatesList = dto.getSkipDates() != null ? dto.getSkipDates() : new ArrayList<>();

        List<LocalDateTime> validDates = bookingDates.stream()
                .filter(date -> !skipDatesList.contains(date.toLocalDate().toString()))
                .toList();

        for (LocalDateTime date : validDates) {
            LocalDateTime startDateTime = date.withHour(dto.getStartTime().getHour()).withMinute(dto.getStartTime().getMinute());
            LocalDateTime endDateTime = date.withHour(dto.getEndTime().getHour()).withMinute(dto.getEndTime().getMinute());
            checkForConflict(dto.getResourceId(), startDateTime, endDateTime, null);
        }

        String groupId = UUID.randomUUID().toString();
        List<Booking> savedBookings = new ArrayList<>();

        for (LocalDateTime date : validDates) {
            LocalDateTime startDateTime = date.withHour(dto.getStartTime().getHour()).withMinute(dto.getStartTime().getMinute());
            LocalDateTime endDateTime = date.withHour(dto.getEndTime().getHour()).withMinute(dto.getEndTime().getMinute());

            Booking booking = new Booking();
            booking.setResource(resource);
            booking.setUser(user);
            booking.setPurpose(dto.getPurpose());
            booking.setStartTime(startDateTime);
            booking.setEndTime(endDateTime);
            booking.setStatus(BookingStatus.PENDING);
            booking.setAttendees(dto.getAttendees());
            booking.setIsRecurring(true);
            booking.setRecurrencePattern(dto.getRecurrencePattern());
            booking.setRecurrenceEndDate(dto.getRecurrenceEndDate());
            booking.setGroupId(groupId);
            if (dto.getRequestedEquipmentIds() != null && !dto.getRequestedEquipmentIds().isEmpty()) {
                booking.setRequestedEquipmentIds(dto.getRequestedEquipmentIds().stream()
                        .map(String::valueOf).reduce((a, b) -> a + "," + b).orElse(null));
            }

            savedBookings.add(bookingRepository.save(booking));
        }

        return BookingResponseDTO.fromEntity(savedBookings.get(0));
    }

    private List<LocalDateTime> generateRecurringDates(BookingRequestDTO dto) {
        List<LocalDateTime> dates = new ArrayList<>();
        LocalDate startDate = dto.getStartTime().toLocalDate();
        LocalDate endDate = dto.getRecurrenceEndDate().toLocalDate();

        if (dto.getRecurrencePattern() == null || dto.getRecurrencePattern().equals("WEEKLY")) {
            LocalDate current = startDate;
            while (!current.isAfter(endDate)) {
                dates.add(current.atTime(dto.getStartTime().toLocalTime()));
                current = current.plusWeeks(1);
            }
        }

        return dates;
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

    public BookingResponseDTO rejectBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new IllegalArgumentException("Cannot cancel an approved booking");
        }

        if (booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot cancel a booking that has already started");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
    }

    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new EntityNotFoundException("Booking not found with id: " + id);
        }
        bookingRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public boolean isAvailable(Long resourceId, LocalDateTime startTime, LocalDateTime endTime) {
        return bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(resourceId, endTime, startTime)
                .stream()
                .noneMatch(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED);
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
