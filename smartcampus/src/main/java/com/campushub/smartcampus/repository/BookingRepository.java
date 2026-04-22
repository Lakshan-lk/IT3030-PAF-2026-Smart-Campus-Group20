package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserId(Long userId);

    List<Booking> findByResourceId(Long resourceId);

    List<Booking> findByStatus(BookingStatus status);

    long countByStatus(BookingStatus status);

    List<Booking> findByUserIdAndStatus(Long userId, BookingStatus status);

    List<Booking> findByResourceIdAndStartTimeBetween(Long resourceId, LocalDateTime start, LocalDateTime end);

    List<Booking> findByResourceIdAndStartTimeBeforeAndEndTimeAfter(Long resourceId, LocalDateTime endTime, LocalDateTime startTime);

    List<Booking> findByRecurrenceGroupId(String recurrenceGroupId);
}
