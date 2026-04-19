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

import java.time.LocalDate;
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

        List<BookingResponseDTO> result = bookingService.createBooking(validDto);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(BookingStatus.PENDING, result.get(0).getStatus());
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
        pendingBooking.setResource(testResource);
        pendingBooking.setUser(testUser);
        pendingBooking.setPurpose("Test");
        pendingBooking.setStartTime(LocalDateTime.now().plusDays(1));
        pendingBooking.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));

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
        pendingBooking.setResource(testResource);
        pendingBooking.setUser(testUser);
        pendingBooking.setPurpose("Test");
        pendingBooking.setStartTime(LocalDateTime.now().plusDays(1));
        pendingBooking.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.rejectBooking(1L, "Room under maintenance");

        assertEquals(BookingStatus.REJECTED, result.getStatus());
        assertEquals("Room under maintenance", result.getRejectionReason());
    }

    @Test
    void cancelBooking_Success() {
        Booking pendingBooking = new Booking();
        pendingBooking.setId(1L);
        pendingBooking.setStatus(BookingStatus.PENDING);
        pendingBooking.setStartTime(LocalDateTime.now().plusDays(2));
        pendingBooking.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));
        pendingBooking.setResource(testResource);
        pendingBooking.setUser(testUser);
        pendingBooking.setPurpose("Test");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.cancelBooking(1L);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelBooking_ApprovedBooking_Success() {
        Booking approvedBooking = new Booking();
        approvedBooking.setId(1L);
        approvedBooking.setStatus(BookingStatus.APPROVED);
        approvedBooking.setStartTime(LocalDateTime.now().plusDays(2));
        approvedBooking.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));
        approvedBooking.setResource(testResource);
        approvedBooking.setUser(testUser);
        approvedBooking.setPurpose("Test");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(approvedBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        BookingResponseDTO result = bookingService.cancelBooking(1L);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelBooking_PastBookingThrowsException() {
        Booking pastBooking = new Booking();
        pastBooking.setId(1L);
        pastBooking.setStatus(BookingStatus.PENDING);
        pastBooking.setStartTime(LocalDateTime.now().minusDays(1));
        pastBooking.setResource(testResource);
        pastBooking.setUser(testUser);
        pastBooking.setPurpose("Test");

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

    @Test
    void createRecurringBooking_Success() {
        validDto.setRecurring(true);
        validDto.setRecurrencePattern("WEEKLY");
        validDto.setRecurrenceEndDate(LocalDate.now().plusWeeks(3));
        validDto.setSkipDates(List.of());

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(any(), any(), any()))
                .thenReturn(List.of());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(1L);
            return b;
        });

        List<BookingResponseDTO> result = bookingService.createBooking(validDto);

        assertNotNull(result);
        assertTrue(result.size() > 1);
        assertTrue(result.get(0).isRecurring());
        assertNotNull(result.get(0).getRecurrenceGroupId());
        verify(bookingRepository, times(result.size())).save(any(Booking.class));
    }

    @Test
    void createRecurringBooking_ConflictOnAnyOccurrence_ThrowsException() {
        validDto.setRecurring(true);
        validDto.setRecurrencePattern("WEEKLY");
        validDto.setRecurrenceEndDate(LocalDate.now().plusWeeks(3));
        validDto.setSkipDates(List.of());

        Booking existingBooking = new Booking();
        existingBooking.setId(2L);
        existingBooking.setResource(testResource);
        existingBooking.setStartTime(validDto.getStartTime());
        existingBooking.setEndTime(validDto.getEndTime());

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(any(), any(), any()))
                .thenReturn(List.of(existingBooking));

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(validDto));
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createRecurringBooking_InvalidEndDate_ThrowsException() {
        validDto.setRecurring(true);
        validDto.setRecurrencePattern("WEEKLY");
        validDto.setRecurrenceEndDate(LocalDate.now().minusDays(1));

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(validDto));
    }

    @Test
    void createRecurringBooking_InvalidPattern_ThrowsException() {
        validDto.setRecurring(true);
        validDto.setRecurrencePattern("DAILY");
        validDto.setRecurrenceEndDate(LocalDate.now().plusWeeks(1));

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(testResource));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () -> bookingService.createBooking(validDto));
    }

    @Test
    void cancelSeries_Success() {
        Booking booking1 = new Booking();
        booking1.setId(1L);
        booking1.setStatus(BookingStatus.APPROVED);
        booking1.setStartTime(LocalDateTime.now().plusDays(1));
        booking1.setEndTime(LocalDateTime.now().plusDays(1).plusHours(1));
        booking1.setRecurrenceGroupId("test-group-123");
        booking1.setResource(testResource);
        booking1.setUser(testUser);
        booking1.setPurpose("Test");

        Booking booking2 = new Booking();
        booking2.setId(2L);
        booking2.setStatus(BookingStatus.PENDING);
        booking2.setStartTime(LocalDateTime.now().plusDays(8));
        booking2.setEndTime(LocalDateTime.now().plusDays(8).plusHours(1));
        booking2.setRecurrenceGroupId("test-group-123");
        booking2.setResource(testResource);
        booking2.setUser(testUser);
        booking2.setPurpose("Test");

        when(bookingRepository.findByRecurrenceGroupId("test-group-123")).thenReturn(List.of(booking1, booking2));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));

        int cancelled = bookingService.cancelSeries("test-group-123");

        assertEquals(2, cancelled);
    }

    @Test
    void cancelSeries_PastBookingsNotCancelled() {
        Booking pastBooking = new Booking();
        pastBooking.setId(1L);
        pastBooking.setStatus(BookingStatus.APPROVED);
        pastBooking.setStartTime(LocalDateTime.now().minusDays(1));
        pastBooking.setEndTime(LocalDateTime.now().minusDays(1).plusHours(1));
        pastBooking.setRecurrenceGroupId("test-group-123");
        pastBooking.setResource(testResource);
        pastBooking.setUser(testUser);
        pastBooking.setPurpose("Test");

        when(bookingRepository.findByRecurrenceGroupId("test-group-123")).thenReturn(List.of(pastBooking));

        int cancelled = bookingService.cancelSeries("test-group-123");

        assertEquals(0, cancelled);
    }
}