package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.EquipmentBookingRequestDTO;
import com.campushub.smartcampus.dto.EquipmentBookingResponseDTO;
<<<<<<< HEAD
=======
import com.campushub.smartcampus.dto.RejectBookingRequestDTO;
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.exception.BookingConflictException;
<<<<<<< HEAD
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
=======
import com.campushub.smartcampus.repository.EquipmentBookingRepository;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.UserRepository;
import com.campushub.smartcampus.util.StatusMapper;
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

        if (!"ACTIVE".equals(StatusMapper.normalizeEquipmentStatus(equipment.getStatus()))) {
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
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
        booking.setStatus(BookingStatus.PENDING);

        EquipmentBooking savedBooking = equipmentBookingRepository.save(booking);
        return mapToDTO(savedBooking);
    }

<<<<<<< HEAD
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

=======
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
        
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
        booking.setStatus(BookingStatus.APPROVED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
<<<<<<< HEAD
    public EquipmentBookingResponseDTO rejectBooking(Long id, String reason) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
=======
    public EquipmentBookingResponseDTO rejectBooking(Long bookingId, RejectBookingRequestDTO requestDTO) {
        EquipmentBooking booking = equipmentBookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(requestDTO.getReason());
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
        return mapToDTO(equipmentBookingRepository.save(booking));
    }

    @Transactional
<<<<<<< HEAD
    public EquipmentBookingResponseDTO cancelBooking(Long id) {
        EquipmentBooking booking = equipmentBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Booking not found with id: " + id));

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToDTO(equipmentBookingRepository.save(booking));
    }
    
    @Transactional(readOnly = true)
    public long getActiveBookingCount() {
        return equipmentBookingRepository.countActiveBookings();
=======
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
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
    }

    private EquipmentBookingResponseDTO mapToDTO(EquipmentBooking booking) {
        EquipmentBookingResponseDTO dto = new EquipmentBookingResponseDTO();
        dto.setId(booking.getId());
<<<<<<< HEAD
        if (booking.getEquipment() != null) {
            dto.setEquipmentId(booking.getEquipment().getId());
            dto.setEquipmentName(booking.getEquipment().getName());
        }
        if (booking.getUser() != null) {
            dto.setUserId(booking.getUser().getId());
            dto.setUserName(booking.getUser().getName());
            dto.setUserEmail(booking.getUser().getEmail());
        }
=======
        dto.setEquipmentId(booking.getEquipment().getId());
        dto.setEquipmentName(booking.getEquipment().getName());
        dto.setEquipmentType(booking.getEquipment().getHireType() != null ? booking.getEquipment().getHireType() : booking.getEquipment().getType().name());
        dto.setUserId(booking.getUser().getId());
        dto.setUserName(booking.getUser().getName());
        dto.setUserEmail(booking.getUser().getEmail());
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
        dto.setPurpose(booking.getPurpose());
        dto.setStartTime(booking.getStartTime());
        dto.setEndTime(booking.getEndTime());
        dto.setStatus(booking.getStatus());
        dto.setRejectionReason(booking.getRejectionReason());
        dto.setCreatedAt(booking.getCreatedAt());
<<<<<<< HEAD
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }
}
=======
        return dto;
    }
}
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
