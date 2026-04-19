package com.campushub.smartcampus.controller;

import com.campushub.smartcampus.dto.ResourceRequestDTO;
import com.campushub.smartcampus.dto.ResourceResponseDTO;
import com.campushub.smartcampus.enums.ResourceStatus;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private ResourceController resourceController;

    private ResourceResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(resourceController)
                .setCustomArgumentResolvers(new PageableHandlerMethodArgumentResolver())
                .build();
        
        responseDTO = new ResourceResponseDTO();
        responseDTO.setId(1L);
        responseDTO.setName("Main Hall");
        responseDTO.setType(ResourceType.LECTURE_HALL);
        responseDTO.setStatus(ResourceStatus.AVAILABLE);
    }

    @Test
    void getAllResources_ReturnsPage() throws Exception {
        Page<ResourceResponseDTO> page = new PageImpl<>(List.of(responseDTO));
        when(resourceService.getResources(any(), any(), any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Main Hall"))
                .andExpect(jsonPath("$.content[0].type").value("LECTURE_HALL"));
    }

    @Test
    void getResourceById_Success() throws Exception {
        when(resourceService.getResourceById(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/api/v1/resources/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Main Hall"));
    }

    @Test
    void createResource_Success() throws Exception {
        String requestJson = "{\"name\":\"Main Hall\", \"type\":\"LECTURE_HALL\", \"capacity\":100}";

        when(resourceService.createResource(any(ResourceRequestDTO.class))).thenReturn(responseDTO);

        mockMvc.perform(post("/api/v1/resources")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Main Hall"));
    }

    @Test
    void deleteResource_Success() throws Exception {
        mockMvc.perform(delete("/api/v1/resources/{id}", 1L))
                .andExpect(status().isNoContent());
    }
}
