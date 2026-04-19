package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.campushub.smartcampus.enums.ResourceType;
import com.campushub.smartcampus.enums.ResourceStatus;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findByIsDeletedFalse(Pageable pageable);

    Page<Resource> findByTypeAndIsDeletedFalse(ResourceType type, Pageable pageable);

    Page<Resource> findByLocationContainingIgnoreCaseAndIsDeletedFalse(String location, Pageable pageable);

    Page<Resource> findByStatusAndIsDeletedFalse(ResourceStatus status, Pageable pageable);

    Page<Resource> findByNameContainingIgnoreCaseAndIsDeletedFalse(String keyword, Pageable pageable);
}
