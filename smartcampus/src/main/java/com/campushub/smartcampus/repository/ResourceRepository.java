package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(String type);

    List<Resource> findByLocation(String location);

    List<Resource> findByStatus(String status);

    List<Resource> findByNameContainingIgnoreCase(String keyword);
}
