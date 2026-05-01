package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.exception.BookingConflictException;
import com.campushub.smartcampus.repository.EquipmentBookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentBookingService {

    @Autowired
    private EquipmentBookingRepository equipmentBookingRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public EquipmentBookingResponseDTO createBooking(Long userId, EquipmentBookingRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Equipment equipment = equipmentRepository.findById(requestDTO.getEquipmentId())
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        if (!"ACTIVE".equals(equipment.getStatus())) {
            throw new RuntimeException("Equipment is not available for booking");
        }

        if (requestDTO.getEndTime().isBefore(requestDTO.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        java.util.List<EquipmentBooking> conflicts = equipmentBookingRepository
                .findByEquipmentIdAndStartTimeBeforeAndEndTimeAfterAndStatusNotIn(
                        requestDTO.getEquipmentId(),
                        requestDTO.getEndTime(),
                        requestDTO.getStartTime(),
                        java.util.List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED)
                );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("Equipment is already booked for the selected time period.");
        }

        EquipmentBooking booking = new EquipmentBooking();
        booking.setUser(user);
        booking.setEquipment(equipment);
        booking.setStartTime(requestDTO.getStartTime());
        booking.setEndTime(requestDTO.getEndTime());
        booking.setPurpose(requestDTO.getPurpose());
        booking.setStatus(BookingStatus.PENDING);

        EquipmentBooking savedBooking = equipmentBookingRepository.save(booking);
        return mapToDTO(savedBooking);
    }

    public Page<EquipmentBookingResponseDTO> getAllBookings(Pageable pageable) {
        return equipmentBookingRepository.findAll(pageable).map(this::mapToDTO);
    }

    public Page<EquipmentBookingResponseDTO> getBookingsByUser(Long userId, Pageable pageable) {
        return equipmentBookingRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    @Transactional
    public EquipmentBookingResponseDTO approveBooking(Long bookingId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.APPROVED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public EquipmentBookingResponseDTO rejectBooking(Long bookingId, RejectBookingRequestDTO requestDTO) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(requestDTO.getReason());
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Long bookingId, Long userId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isAdmin = user.getRole().equals("ADMIN") || user.getRole().equals("SUPER_ADMIN");
        if (!isAdmin && !booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this booking");
        }

        equipmentBookingRepository.delete(booking);
    }

    private EquipmentBookingResponseDTO mapToDTO(EquipmentBooking booking) {
        EquipmentBookingResponseDTO dto = new EquipmentBookingResponseDTO();
        dto.setId(booking.getId());
        dto.setEquipmentId(booking.getEquipment().getId());
        dto.setEquipmentName(booking.getEquipment().getName());
        dto.setEquipmentType(booking.getEquipment().getHireType() != null ? booking.getEquipment().getHireType() : booking.getEquipment().getType().name());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        dto.setUserEmail(booking.getUser().getEmail());
        dto.setPurpose(booking.getPurpose());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
        return dto;
    }
}
