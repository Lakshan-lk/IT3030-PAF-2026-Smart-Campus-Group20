package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByDeletedFalse(Pageable pageable);

    Page<Resource> findByTypeAndDeletedFalse(ResourceType type, Pageable pageable);

    Page<Resource> findByLocationContainingIgnoreCaseAndDeletedFalse(String location, Pageable pageable);

    Page<Resource> findByStatusAndDeletedFalse(ResourceStatus status, Pageable pageable);

    Page<Resource> findByNameContainingIgnoreCaseAndDeletedFalse(String keyword, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.deleted = false AND r.status = 'ACTIVE'")
    Page<Resource> findByStatusAvailable(Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE r.id NOT IN " +
           "(SELECT b.resource.id FROM Booking b WHERE b.status IN (com.campushub.smartcampus.enums.BookingStatus.PENDING, com.campushub.smartcampus.enums.BookingStatus.APPROVED) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime) " +
           "AND r.deleted = false AND r.status = 'ACTIVE'")
    Page<Resource> findAvailableResources(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
}