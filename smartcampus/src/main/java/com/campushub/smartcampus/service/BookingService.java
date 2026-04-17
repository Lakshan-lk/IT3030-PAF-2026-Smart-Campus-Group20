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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

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
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + dto.getResourceId()));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + dto.getUserId()));

        checkForConflict(dto.getResourceId(), dto.getStartTime(), dto.getEndTime(), null);

        Booking booking = BookingRequestDTO.toEntity(dto, resource, user);
        Booking saved = bookingRepository.save(booking);
        return BookingResponseDTO.fromEntity(saved);
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

    private void checkForConflict(Long resourceId, LocalDateTime startTime, LocalDateTime endTime, Long excludeBookingId) {
        List<Booking> conflicts = bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(
                resourceId, endTime, startTime);

        Booking conflict = conflicts.stream()
                .filter(b -> excludeBookingId == null || !b.getId().equals(excludeBookingId))
                .findFirst()
                .orElse(null);

        if (conflict != null) {
            throw new BookingConflictException(
                    "Resource '" + conflict.getResource().getName() + "' is already booked from "
                    + conflict.getStartTime() + " to " + conflict.getEndTime());
        }
    }
}
