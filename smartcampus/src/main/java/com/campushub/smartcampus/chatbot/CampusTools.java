package com.campushub.smartcampus.chatbot;

import com.campushub.smartcampus.dto.*;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.service.BookingService;
import com.campushub.smartcampus.service.EquipmentBookingService;
import com.campushub.smartcampus.service.ResourceService;
import com.campushub.smartcampus.service.TicketService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class CampusTools {

    private final BookingService bookingService;
    private final ResourceService resourceService;
    private final TicketService ticketService;
    private final EquipmentBookingService equipmentBookingService;
    private final EquipmentRepository equipmentRepository;

    public CampusTools(BookingService bookingService,
                       ResourceService resourceService,
                       TicketService ticketService,
                       EquipmentBookingService equipmentBookingService,
                       EquipmentRepository equipmentRepository) {
        this.bookingService = bookingService;
        this.resourceService = resourceService;
        this.ticketService = ticketService;
        this.equipmentBookingService = equipmentBookingService;
        this.equipmentRepository = equipmentRepository;
    }

    public String getUserContext(Long userId) {
        if (userId == null) {
            return "- No user ID provided.";
        }

        try {
            long activeBookings = bookingService.getBookingsByUserId(userId).stream()
                    .filter(b -> b.getStatus() == BookingStatus.APPROVED || b.getStatus() == BookingStatus.PENDING)
                    .count();

            long ticketCount = ticketService.getTicketsByUserId(userId).size();

            return String.format(
                    "- Current user ID: %d\n- Active or pending bookings: %d\n- Total tickets: %d",
                    userId,
                    activeBookings,
                    ticketCount
            );
        } catch (Exception e) {
            return "- User context unavailable: " + e.getMessage();
        }
    }

    public String listResources() {
        try {
            Page<ResourceResponseDTO> page = resourceService.getResources(
                    null, null, null, null,
                    null, null,
                    PageRequest.of(0, 50),
                    null, null
            );

            if (page.getContent().isEmpty()) {
                return "No resources found.";
            }

            StringBuilder sb = new StringBuilder("Campus resources:\n");

            for (ResourceResponseDTO r : page.getContent()) {
                sb.append(String.format(
                        "- ID: %d | Name: %s | Type: %s | Location: %s | Capacity: %s | Status: %s\n",
                        r.getId(),
                        r.getName(),
                        r.getType(),
                        r.getLocation(),
                        r.getCapacity(),
                        r.getStatus()
                ));
            }

            return sb.toString();
        } catch (Exception e) {
            return "Failed to list resources: " + e.getMessage();
        }
    }

    public String searchResourceByName(String name) {
        try {
            Page<ResourceResponseDTO> page = resourceService.getResources(
                    null, null, null, name,
                    null, null,
                    PageRequest.of(0, 20),
                    null, null
            );

            if (page.getContent().isEmpty()) {
                return "No resource found matching: " + name;
            }

            StringBuilder sb = new StringBuilder("Matching resources:\n");

            for (ResourceResponseDTO r : page.getContent()) {
                sb.append(String.format(
                        "- ID: %d | Name: %s | Type: %s | Location: %s | Capacity: %s | Status: %s\n",
                        r.getId(),
                        r.getName(),
                        r.getType(),
                        r.getLocation(),
                        r.getCapacity(),
                        r.getStatus()
                ));
            }

            return sb.toString();
        } catch (Exception e) {
            return "Resource search failed: " + e.getMessage();
        }
    }

    public String createBooking(Long resourceId, Long userId, String startTime, String endTime, String purpose, Integer attendees) {
        try {
            if (userId == null) {
                return "User ID is required to create a booking.";
            }

            BookingRequestDTO dto = new BookingRequestDTO();
            dto.setResourceId(resourceId);
            dto.setUserId(userId);
            dto.setStartTime(LocalDateTime.parse(startTime));
            dto.setEndTime(LocalDateTime.parse(endTime));
            dto.setPurpose(purpose);
            dto.setAttendees(attendees);
            dto.setRecurring(false);

            List<BookingResponseDTO> created = bookingService.createBooking(dto);

            if (created.isEmpty()) {
                return "Booking request processed, but no booking was returned.";
            }

            BookingResponseDTO b = created.get(0);

            return String.format(
                    "Booking created successfully. Booking ID: %d | Resource: %s | Time: %s - %s | Status: %s",
                    b.getId(),
                    b.getResourceName(),
                    b.getFormattedStartTime(),
                    b.getFormattedEndTime(),
                    b.getStatus()
            );

        } catch (Exception e) {
            return "Booking failed: " + e.getMessage();
        }
    }

    public String getUserBookings(Long userId) {
        try {
            if (userId == null) {
                return "User ID is required to view bookings.";
            }

            List<BookingResponseDTO> bookings = bookingService.getBookingsByUserId(userId);

            if (bookings.isEmpty()) {
                return "No bookings found for this user.";
            }

            StringBuilder sb = new StringBuilder("Your bookings:\n");

            for (BookingResponseDTO b : bookings) {
                sb.append(String.format(
                        "- Booking ID: %d | Resource: %s | Time: %s - %s | Status: %s | Purpose: %s\n",
                        b.getId(),
                        b.getResourceName(),
                        b.getFormattedStartTime(),
                        b.getFormattedEndTime(),
                        b.getStatus(),
                        b.getPurpose()
                ));
            }

            return sb.toString();
        } catch (Exception e) {
            return "Failed to get bookings: " + e.getMessage();
        }
    }

    public String cancelBooking(Long bookingId) {
        try {
            BookingResponseDTO cancelled = bookingService.cancelBooking(bookingId);
            return "Booking cancelled successfully. Booking ID: " + cancelled.getId();
        } catch (Exception e) {
            return "Failed to cancel booking: " + e.getMessage();
        }
    }

    public String listEquipment() {
        try {
            List<Equipment> equipment = equipmentRepository.findAll();

            if (equipment.isEmpty()) {
                return "No equipment found.";
            }

            StringBuilder sb = new StringBuilder("Campus equipment:\n");

            for (Equipment e : equipment) {
                sb.append(String.format(
                        "- ID: %d | Name: %s | Type: %s | Status: %s | Hire Type: %s\n",
                        e.getId(),
                        e.getName(),
                        e.getType() != null ? e.getType().name() : "N/A",
                        e.getStatus(),
                        e.getHireType() != null ? e.getHireType() : "N/A"
                ));
            }

            return sb.toString();
        } catch (Exception e) {
            return "Failed to list equipment: " + e.getMessage();
        }
    }

    public String createEquipmentBooking(Long equipmentId, Long userId, String startTime, String endTime, String purpose) {
        try {
            if (userId == null) {
                return "User ID is required to book equipment.";
            }

            EquipmentBookingRequestDTO dto = new EquipmentBookingRequestDTO();
            dto.setUserId(userId);
            dto.setEquipmentId(equipmentId);
            dto.setStartTime(LocalDateTime.parse(startTime));
            dto.setEndTime(LocalDateTime.parse(endTime));
            dto.setPurpose(purpose);

            EquipmentBookingResponseDTO saved = equipmentBookingService.createBooking(userId, dto);

            return String.format(
                    "Equipment booking created successfully. Booking ID: %d | Equipment: %s | Time: %s - %s | Status: %s",
                    saved.getId(),
                    saved.getEquipmentName(),
                    saved.getStartTime(),
                    saved.getEndTime(),
                    saved.getStatus()
            );
        } catch (Exception e) {
            return "Equipment booking failed: " + e.getMessage();
        }
    }

    public String getUserTickets(Long userId) {
        try {
            if (userId == null) {
                return "User ID is required to view tickets.";
            }

            List<?> tickets = ticketService.getTicketsByUserId(userId);

            if (tickets.isEmpty()) {
                return "No tickets found for this user.";
            }

            StringBuilder sb = new StringBuilder("Your tickets:\n");

            for (Object t : tickets) {
                sb.append(String.format(
                        "- Ticket ID: %s | Category: %s | Priority: %s | Status: %s | Description: %s\n",
                        readValue(t, "getId"),
                        readValue(t, "getCategory"),
                        readValue(t, "getPriority"),
                        readValue(t, "getStatus"),
                        readValue(t, "getDescription")
                ));
            }

            return sb.toString();
        } catch (Exception e) {
            return "Failed to get tickets: " + e.getMessage();
        }
    }

    private String readValue(Object object, String getterName) {
        try {
            Method method = object.getClass().getMethod(getterName);
            Object value = method.invoke(object);
            return value != null ? value.toString() : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }
}