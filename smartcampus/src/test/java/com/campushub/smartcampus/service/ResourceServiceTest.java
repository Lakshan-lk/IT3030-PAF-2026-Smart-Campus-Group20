package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.entity.Resource;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.repository.ResourceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource resource;
    private ResourceRequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        resource = new Resource();
        resource.setId(1L);
        resource.setName("Test Hall");
        resource.setType(ResourceType.LECTURE_HALL);
        resource.setStatus(ResourceStatus.AVAILABLE);
        resource.setCapacity(50);
        resource.setDeleted(false);

        requestDTO = new ResourceRequestDTO();
        requestDTO.setName("New Lab");
        requestDTO.setType(ResourceType.LAB);
        requestDTO.setStatus(ResourceStatus.AVAILABLE);
        requestDTO.setCapacity(30);
    }

    @Test
    void getResourceById_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        ResourceResponseDTO response = resourceService.getResourceById(1L);

        assertNotNull(response);
        assertEquals("Test Hall", response.getName());
        assertEquals(ResourceType.LECTURE_HALL, response.getType());
        verify(resourceRepository, times(1)).findById(1L);
    }

    @Test
    void getResourceById_NotFound() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> resourceService.getResourceById(1L));
    }

    @Test
    void getResourceById_DeletedResource() {
        resource.setDeleted(true);
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        assertThrows(EntityNotFoundException.class, () -> resourceService.getResourceById(1L));
    }

    @Test
    void createResource_Success() {
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> {
            Resource r = i.getArgument(0);
            r.setId(2L);
            return r;
        });

        ResourceResponseDTO response = resourceService.createResource(requestDTO);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("New Lab", response.getName());
        verify(resourceRepository, times(1)).save(any(Resource.class));
    }

    @Test
    void createResource_InvalidCapacity() {
        requestDTO.setCapacity(-5);

        assertThrows(IllegalArgumentException.class, () -> resourceService.createResource(requestDTO));
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void updateResource_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceRepository.save(any(Resource.class))).thenReturn(resource);

        ResourceResponseDTO response = resourceService.updateResource(1L, requestDTO);

        assertNotNull(response);
        assertEquals("New Lab", response.getName()); // It should have updated the entity
        assertEquals(ResourceType.LAB, response.getType());
        verify(resourceRepository, times(1)).save(resource);
    }

    @Test
    void deleteResource_Success() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        resourceService.deleteResource(1L);

        assertTrue(resource.isDeleted());
        verify(resourceRepository, times(1)).save(resource); // Should save with isDeleted=true
    }
}
