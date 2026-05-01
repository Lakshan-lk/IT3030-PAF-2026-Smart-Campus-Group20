package com.campushub.smartcampus.repository;

import com.campushub.smartcampus.entity.Equipment;
import com.campushub.smartcampus.enums.EquipmentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByRoomId(Long roomId);

    List<Equipment> findByRoomIdAndType(Long roomId, EquipmentType type);

    List<Equipment> findByRoomIdNot(Long roomId);

    List<Equipment> findByHiringEquipmentTrue();
}
