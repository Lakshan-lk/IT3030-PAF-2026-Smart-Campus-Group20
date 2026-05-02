package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.exception.BookingConflictException;
import com.campushub.smartcampus.exception.ResourceNotFoundException;
import com.campushub.smartcampus.repository.EquipmentBookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.UserRepository;
import com.campushub.smartcampus.util.StatusMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        return createBooking(request.getUserId(), request);
    }

    @Transactional
    public EquipmentBookingResponseDTO createBooking(Long userId, EquipmentBookingRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Equipment equipment = equipmentRepository.findById(requestDTO.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + requestDTO.getEquipmentId()));

        if (!"ACTIVE".equals(StatusMapper.normalizeEquipmentStatus(equipment.getStatus()))) {
            throw new IllegalArgumentException("Equipment is not available for booking");
        }

        if (!requestDTO.getEndTime().isAfter(requestDTO.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        List<EquipmentBooking> conflicts = equipmentBookingRepository.findConflictingBookings(
                requestDTO.getEquipmentId(),
                requestDTO.getStartTime(),
                requestDTO.getEndTime()
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

        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<EquipmentBookingResponseDTO> getAllBookings(Long userId) {
        List<EquipmentBooking> bookings = userId != null
                ? equipmentBookingRepository.findByUserIdOrderByStartTimeDesc(userId)
                : equipmentBookingRepository.findAllByOrderByStartTimeDesc();
        return bookings.stream().map(this::mapToDTO).toList();
    }

    @Transactional(readOnly = true)
    public Page<EquipmentBookingResponseDTO> getAllBookings(Pageable pageable) {
        return equipmentBookingRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<EquipmentBookingResponseDTO> getBookingsByUser(Long userId, Pageable pageable) {
        return equipmentBookingRepository.findByUserId(userId, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public EquipmentBookingResponseDTO getBookingById(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with id: " + id));
        return mapToDTO(booking);
    }

    @Transactional
    public EquipmentBookingResponseDTO approveBooking(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with id: " + id));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setRejectionReason(null);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public EquipmentBookingResponseDTO rejectBooking(Long id, String reason) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with id: " + id));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public EquipmentBookingResponseDTO rejectBooking(Long id, RejectBookingRequestDTO requestDTO) {
        return rejectBooking(id, requestDTO.getReason());
    }

    @Transactional
    public EquipmentBookingResponseDTO cancelBooking(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with id: " + id));
        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Long id, Long userId) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment booking not found with id: " + id));
        if (userId != null && !booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own bookings");
        }
        equipmentBookingRepository.delete(booking);
    }

    @Transactional(readOnly = true)
    public long getActiveBookingCount() {
        return equipmentBookingRepository.countActiveBookings();
    }

    private EquipmentBookingResponseDTO mapToDTO(EquipmentBooking booking) {
        EquipmentBookingResponseDTO dto = new EquipmentBookingResponseDTO();
        dto.setId(booking.getId());
        dto.setEquipmentId(booking.getEquipment().getId());
        dto.setEquipmentName(booking.getEquipment().getName());
        dto.setEquipmentType(booking.getEquipment().getType() != null ? booking.getEquipment().getType().name() : null);
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
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
