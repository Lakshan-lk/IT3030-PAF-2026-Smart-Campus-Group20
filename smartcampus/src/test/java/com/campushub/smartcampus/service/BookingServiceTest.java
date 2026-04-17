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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Resource testResource;
    private User testUser;
    private BookingRequestDTO validDto;

    @BeforeEach
    void setUp() {
        testResource = new Resource();
        testResource.setId(1L);
        testResource.setName("Test Room");

        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        validDto = new BookingRequestDTO();
        validDto.setResourceId(1L);
        validDto.setUserId(1L);
        validDto.setPurpose("Test Meeting");
        validDto.setStartTime(LocalDateTime.now().plusDays(1));
        validDto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
    }

    @Test
    void createBooking_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(any(), any(), any()))
                .thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(1L);
            return b;
        });

        BookingResponseDTO result = bookingService.createBooking(validDto);

        assertNotNull(result);
        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_ConflictThrowsException() {
        Booking existingBooking = new Booking();
        existingBooking.setId(2L);
        existingBooking.setResource(testResource);
        existingBooking.setStartTime(validDto.getStartTime().plusHours(1));
        existingBooking.setEndTime(validDto.getStartTime().plusHours(3));

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(any(), any(), any()))
                .thenReturn(List.of(existingBooking));

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(validDto));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_EndTimeBeforeStartTimeThrowsException() {
        validDto.setEndTime(validDto.getStartTime().minusHours(1));

        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(validDto));
    }

    @Test
    void approveBooking_Success() {
        Booking pendingBooking = new Booking();
        pendingBooking.setId(1L);
        pendingBooking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.approveBooking(1L);

        assertEquals(BookingStatus.APPROVED, result.getStatus());
    }

    @Test
    void approveBooking_NotPendingThrowsException() {
        Booking approvedBooking = new Booking();
        approvedBooking.setId(1L);
        approvedBooking.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(approvedBooking));

        assertThrows(IllegalArgumentException.class, () -> bookingService.approveBooking(1L));
    }

    @Test
    void rejectBooking_Success() {
        Booking pendingBooking = new Booking();
        pendingBooking.setId(1L);
        pendingBooking.setStatus(BookingStatus.PENDING);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.rejectBooking(1L);

        assertEquals(BookingStatus.REJECTED, result.getStatus());
    }

    @Test
    void cancelBooking_Success() {
        Booking pendingBooking = new Booking();
        pendingBooking.setId(1L);
        pendingBooking.setStatus(BookingStatus.PENDING);
        pendingBooking.setStartTime(LocalDateTime.now().plusDays(2));

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.cancelBooking(1L);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelBooking_AlreadyApprovedThrowsException() {
        Booking approvedBooking = new Booking();
        approvedBooking.setId(1L);
        approvedBooking.setStatus(BookingStatus.APPROVED);

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(approvedBooking));

        assertThrows(IllegalArgumentException.class, () -> bookingService.cancelBooking(1L));
    }

    @Test
    void cancelBooking_PastBookingThrowsException() {
        Booking pastBooking = new Booking();
        pastBooking.setId(1L);
        pastBooking.setStatus(BookingStatus.PENDING);
        pastBooking.setStartTime(LocalDateTime.now().minusDays(1));

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pastBooking));

        assertThrows(IllegalArgumentException.class, () -> bookingService.cancelBooking(1L));
    }

    @Test
    void countActiveBookings_ReturnsApprovedCount() {
        List<Booking> approvedBookings = List.of(new Booking(), new Booking());
        when(bookingRepository.findByStatus(BookingStatus.APPROVED)).thenReturn(approvedBookings);

        long count = bookingService.countActiveBookings();

        assertEquals(2, count);
    }
}