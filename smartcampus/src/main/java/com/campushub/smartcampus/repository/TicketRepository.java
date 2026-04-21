package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Ticket;
import com.campushub.smartcampus.enums.TicketCategory;
import com.campushub.smartcampus.enums.TicketPriority;
import com.campushub.smartcampus.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserId(Long userId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByAssignedToId(Long userId);

    List<Ticket> findByPriority(TicketPriority priority);

    List<Ticket> findByCategoryAndStatus(TicketCategory category, TicketStatus status);

    List<Ticket> findByCategory(TicketCategory category);

    List<Ticket> findByResourceId(Long resourceId);
}
