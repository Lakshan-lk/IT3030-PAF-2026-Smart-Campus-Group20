package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.EquipmentBooking;
import com.campushub.smartcampus.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {

    List<EquipmentBooking> findByUserIdOrderByStartTimeDesc(Long userId);

    List<EquipmentBooking> findAllByOrderByStartTimeDesc();

    Page<EquipmentBooking> findByUserId(Long userId, Pageable pageable);

    Page<EquipmentBooking> findByStatus(BookingStatus status, Pageable pageable);

    @Query("SELECT COUNT(eb) FROM EquipmentBooking eb WHERE eb.status = 'APPROVED' OR eb.status = 'PENDING'")
    long countActiveBookings();

    @Query("SELECT eb FROM EquipmentBooking eb WHERE eb.equipment.id = :equipmentId AND eb.status IN ('PENDING', 'APPROVED') AND " +
           "((eb.startTime <= :endTime AND eb.endTime >= :startTime))")
    List<EquipmentBooking> findConflictingBookings(@Param("equipmentId") Long equipmentId,
                                                   @Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime);

    @Modifying
    @Query("DELETE FROM EquipmentBooking eb WHERE eb.equipment.id IN :equipmentIds")
    int deleteByEquipmentIdIn(@Param("equipmentIds") List<Long> equipmentIds);

    List<EquipmentBooking> findByEquipmentIdAndStartTimeBeforeAndEndTimeAfterAndStatusNotIn(
            Long equipmentId,
            LocalDateTime endTime,
            LocalDateTime startTime,
            List<BookingStatus> statuses
    );
}
