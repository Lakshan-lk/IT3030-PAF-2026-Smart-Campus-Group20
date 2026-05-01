package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.exception.BookingConflictException;
import com.campushub.smartcampus.exception.ResourceNotFoundException;
import com.campushub.smartcampus.repository.EquipmentBookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EquipmentBookingService {

    private final EquipmentBookingRepository equipmentBookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public EquipmentBookingService(EquipmentBookingRepository equipmentBookingRepository,
                                   EquipmentRepository equipmentRepository,
                                   UserRepository userRepository) {
        this.equipmentBookingRepository = equipmentBookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EquipmentBookingResponseDTO createBooking(EquipmentBookingRequestDTO request) {
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        List<EquipmentBooking> conflictingBookings = equipmentBookingRepository.findConflictingBookings(
                request.getEquipmentId(), request.getStartTime(), request.getEndTime());

        if (!conflictingBookings.isEmpty()) {
            throw new BookingConflictException("The equipment is already booked during this time period.");
        }

        EquipmentBooking booking = new EquipmentBooking();
        booking.setEquipment(equipment);
        booking.setUser(user);
        booking.setPurpose(request.getPurpose());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(BookingStatus.PENDING);

        EquipmentBooking savedBooking = equipmentBookingRepository.save(booking);
        return mapToDTO(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<EquipmentBookingResponseDTO> getAllBookings(Long userId) {
        List<EquipmentBooking> bookings;
        if (userId != null) {
            bookings = equipmentBookingRepository.findByUserIdOrderByStartTimeDesc(userId);
        } else {
            bookings = equipmentBookingRepository.findAllByOrderByStartTimeDesc();
        }
        return bookings.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipmentBookingResponseDTO getBookingById(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));
        return mapToDTO(booking);
    }

    @Transactional
    public EquipmentBookingResponseDTO approveBooking(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));

        booking.setStatus(BookingStatus.APPROVED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public EquipmentBookingResponseDTO rejectBooking(Long id, String reason) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public EquipmentBookingResponseDTO cancelBooking(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }
    
    @Transactional(readOnly = true)
    public long getActiveBookingCount() {
        return equipmentBookingRepository.countActiveBookings();
    }

    private EquipmentBookingResponseDTO mapToDTO(EquipmentBooking booking) {
        EquipmentBookingResponseDTO dto = new EquipmentBookingResponseDTO();
        dto.setId(booking.getId());
        if (booking.getEquipment() != null) {
            dto.setEquipmentId(booking.getEquipment().getId());
            dto.setEquipmentName(booking.getEquipment().getName());
        }
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setUserName(booking.getUser().getName());
            dto.setUserEmail(booking.getUser().getEmail());
        }
        dto.setPurpose(booking.getPurpose());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}