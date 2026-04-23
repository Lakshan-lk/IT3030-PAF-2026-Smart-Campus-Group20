package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.entity.Booking;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.EquipmentType;
import com.campushub.smartcampus.enums.BookingStatus;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.repository.EquipmentRepository;
import com.campushub.smartcampus.repository.BookingRepository;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final EquipmentRepository equipmentRepository;
    private final BookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, EquipmentRepository equipmentRepository,
                           BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.equipmentRepository = equipmentRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public Page<ResourceResponseDTO> getResources(String type, String location, String status, String search,
                                          List<String> equipmentTypes, Integer minCapacity, Pageable pageable,
                                          LocalDateTime startTime, LocalDateTime endTime) {
        String normalizedSearch = search != null ? search.trim().toLowerCase() : null;
        String normalizedLocation = location != null ? location.trim().toLowerCase() : null;
        Set<EquipmentType> requestedEquipmentTypes = parseEquipmentTypes(equipmentTypes);
        ResourceType requestedType = parseResourceType(type);
        ResourceStatus requestedStatus = parseResourceStatus(status);
        Map<Long, List<Equipment>> equipmentByResourceId = equipmentRepository.findAll().stream()
                .filter(eq -> eq.getRoom() != null && eq.getRoom().getId() != null)
                .collect(Collectors.groupingBy(eq -> eq.getRoom().getId()));

        List<ResourceResponseDTO> filtered = resourceRepository.findAllByDeletedFalse().stream()
                .filter(resource -> matchesSearch(resource, normalizedSearch))
                .filter(resource -> matchesType(resource, requestedType))
                .filter(resource -> matchesLocation(resource, normalizedLocation))
                .filter(resource -> matchesStatus(resource, requestedStatus))
                .filter(resource -> matchesAvailability(resource, startTime, endTime))
                .filter(resource -> matchesEquipment(resource, requestedEquipmentTypes, equipmentByResourceId))
                .filter(resource -> matchesCapacity(resource, minCapacity))
                .sorted(Comparator.comparing(Resource::getId, Comparator.nullsLast(Long::compareTo)))
                .map(resource -> ResourceResponseDTO.fromEntity(resource, equipmentByResourceId.get(resource.getId())))
                .toList();

        int start = (int) Math.min(pageable.getOffset(), filtered.size());
        int end = Math.min(start + pageable.getPageSize(), filtered.size());
        List<ResourceResponseDTO> pageContent = start < end ? filtered.subList(start, end) : List.of();

        return new PageImpl<>(pageContent, pageable, filtered.size());
    }

    @Transactional(readOnly = true)
    public ResourceResponseDTO getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));
        List<Equipment> equipment = equipmentRepository.findByRoomId(id);
        return ResourceResponseDTO.fromEntity(resource, equipment);
    }

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        Resource resource = new Resource();
        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(ResourceType.valueOf(dto.getType().toUpperCase()));
        resource.setLocation(dto.getLocation());
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            resource.setStatus(ResourceStatus.valueOf(dto.getStatus().trim().toUpperCase()));
        } else {
            resource.setStatus(ResourceStatus.ACTIVE);
        }

        Resource saved = resourceRepository.save(resource);
        return ResourceResponseDTO.fromEntity(saved, List.of());
    }

    public ResourceResponseDTO updateResource(Long id, ResourceRequestDTO dto) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Resource not found with id: " + id));

        resource.setName(dto.getName());
        resource.setDescription(dto.getDescription());
        resource.setType(ResourceType.valueOf(dto.getType().toUpperCase()));
        resource.setLocation(dto.getLocation());
        resource.setCapacity(dto.getCapacity());
        resource.setImageUrl(dto.getImageUrl());

        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            resource.setStatus(ResourceStatus.valueOf(dto.getStatus().trim().toUpperCase()));
        }

        Resource saved = resourceRepository.save(resource);
        List<Equipment> equipment = equipmentRepository.findByRoomId(id);
        return ResourceResponseDTO.fromEntity(saved, equipment);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new EntityNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    private boolean matchesSearch(Resource resource, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        return contains(resource.getName(), search)
                || contains(resource.getDescription(), search)
                || contains(resource.getLocation(), search)
                || contains(resource.getType() != null ? resource.getType().name() : null, search)
                || contains(resource.getStatus() != null ? resource.getStatus().name() : null, search);
    }

    private boolean matchesType(Resource resource, ResourceType type) {
        return type == null || resource.getType() == type;
    }

    private boolean matchesLocation(Resource resource, String location) {
        return location == null || location.isBlank() || contains(resource.getLocation(), location);
    }

    private boolean matchesStatus(Resource resource, ResourceStatus status) {
        return status == null || resource.getStatus() == status;
    }

    private boolean matchesCapacity(Resource resource, Integer minCapacity) {
        return minCapacity == null || (resource.getCapacity() != null && resource.getCapacity() >= minCapacity);
    }

    private boolean matchesEquipment(Resource resource, Set<EquipmentType> requestedEquipmentTypes,
                                     Map<Long, List<Equipment>> equipmentByResourceId) {
        if (requestedEquipmentTypes == null || requestedEquipmentTypes.isEmpty()) {
            return true;
        }

        List<Equipment> equipment = equipmentByResourceId.get(resource.getId());
        if (equipment == null || equipment.isEmpty()) {
            return false;
        }

        Set<EquipmentType> availableTypes = equipment.stream()
                .map(Equipment::getType)
                .collect(Collectors.toSet());
        return availableTypes.containsAll(requestedEquipmentTypes);
    }

    private boolean matchesAvailability(Resource resource, LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            return true;
        }

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            return false;
        }

        List<Booking> overlappingBookings = bookingRepository.findByResourceIdAndStartTimeBeforeAndEndTimeAfter(
                resource.getId(), endTime, startTime);

        return overlappingBookings.stream()
                .noneMatch(booking -> booking.getStatus() == BookingStatus.PENDING
                        || booking.getStatus() == BookingStatus.APPROVED);
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase().contains(search);
    }

    private ResourceType parseResourceType(String type) {
        if (type == null || type.isBlank()) {
            return null;
        }
        try {
            return ResourceType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private ResourceStatus parseResourceStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return ResourceStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private Set<EquipmentType> parseEquipmentTypes(List<String> equipmentTypes) {
        if (equipmentTypes == null || equipmentTypes.isEmpty()) {
            return Set.of();
        }

        Set<EquipmentType> parsed = new HashSet<>();
        for (String equipmentType : equipmentTypes) {
            if (equipmentType == null || equipmentType.isBlank()) {
                continue;
            }
            try {
                parsed.add(EquipmentType.valueOf(equipmentType.trim().toUpperCase()));
            } catch (IllegalArgumentException ignored) {
                // Ignore unsupported equipment types from the client.
            }
        }
        return parsed;
    }
}
