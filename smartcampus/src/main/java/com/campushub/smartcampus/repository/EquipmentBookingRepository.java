package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.EquipmentBooking;
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
}
