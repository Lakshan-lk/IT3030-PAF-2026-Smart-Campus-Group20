package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.EquipmentBooking;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {
    List<EquipmentBooking> findByUserIdOrderByStartTimeDesc(Long userId);
    List<EquipmentBooking> findAllByOrderByStartTimeDesc();
    
    @Query("SELECT COUNT(eb) FROM EquipmentBooking eb WHERE eb.status = 'ACTIVE' OR eb.status = 'PENDING'")
    long countActiveBookings();
    
    @Query("SELECT eb FROM EquipmentBooking eb WHERE eb.equipment.id = :equipmentId AND eb.status IN ('PENDING', 'APPROVED') AND " +
           "((eb.startTime <= :endTime AND eb.endTime >= :startTime))")
    List<EquipmentBooking> findConflictingBookings(@Param("equipmentId") Long equipmentId, 
                                                   @Param("startTime") LocalDateTime startTime, 
                                                   @Param("endTime") LocalDateTime endTime);
=======
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
>>>>>>> 074e5aa570971928637500386fbb67ef1cfb0a82
}
