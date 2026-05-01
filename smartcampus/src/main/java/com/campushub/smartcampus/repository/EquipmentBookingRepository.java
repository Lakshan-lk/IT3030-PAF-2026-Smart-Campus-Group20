package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {
    Page<EquipmentBooking> findByUserId(Long userId, Pageable pageable);
    Page<EquipmentBooking> findByStatus(BookingStatus status, Pageable pageable);
    
    java.util.List<EquipmentBooking> findByEquipmentIdAndStartTimeBeforeAndEndTimeAfterAndStatusNotIn(
            Long equipmentId, 
            java.time.LocalDateTime endTime, 
            java.time.LocalDateTime startTime, 
            java.util.List<BookingStatus> statuses
    );
}
