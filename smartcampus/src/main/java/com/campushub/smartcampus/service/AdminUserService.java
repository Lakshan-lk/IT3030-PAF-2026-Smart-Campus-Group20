package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.AdminUserCreateRequestDTO;
import com.campushub.smartcampus.dto.AdminUserResponseDTO;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.UserType;
import com.campushub.smartcampus.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AdminUserService {

    private static final int DEFAULT_REGISTRATION_YEAR = 2025;

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponseDTO> getAllUsers() {
        return userRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AdminUserResponseDTO::fromEntity)
                .toList();
    }

    public AdminUserResponseDTO createUser(AdminUserCreateRequestDTO dto) {
        validateUniqueness(dto);
        validateTypeSpecificFields(dto);

        int registrationYear = dto.getRegistrationYear() != null ? dto.getRegistrationYear() : DEFAULT_REGISTRATION_YEAR;
        if (registrationYear < 2000 || registrationYear > 2099) {
            throw new IllegalArgumentException("Registration year must be between 2000 and 2099");
        }

        String universityId = generateUniversityId(dto.getUserType(), registrationYear);

        User user = new User();
        user.setUniversityId(universityId);
        user.setName(dto.getName().trim());
        user.setEmail(dto.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setAge(dto.getAge());
        user.setAddress(dto.getAddress().trim());
        user.setPhone(dto.getPhone().trim());
        user.setUserType(dto.getUserType());
        user.setRegistrationYear(registrationYear);
        user.setCourse(cleanOptional(dto.getCourse()));
        user.setYearOfStudy(dto.getYearOfStudy());
        user.setDepartment(cleanOptional(dto.getDepartment()));
        user.setDesignation(cleanOptional(dto.getDesignation()));
        user.setRole("USER");

        User saved = userRepository.save(user);
        return AdminUserResponseDTO.fromEntity(saved);
    }

    private void validateUniqueness(AdminUserCreateRequestDTO dto) {
        String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
        String phone = dto.getPhone().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email is already in use");
        }
        if (userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Phone number is already in use");
        }
    }

    private void validateTypeSpecificFields(AdminUserCreateRequestDTO dto) {
        if (dto.getUserType() == UserType.STUDENT) {
            if (dto.getCourse() == null || dto.getCourse().isBlank()) {
                throw new IllegalArgumentException("Course is required for students");
            }
            if (dto.getYearOfStudy() == null) {
                throw new IllegalArgumentException("Year of study is required for students");
            }
        }

        if (dto.getUserType() == UserType.STAFF) {
            if (dto.getDepartment() == null || dto.getDepartment().isBlank()) {
                throw new IllegalArgumentException("Department is required for staff");
            }
            if (dto.getDesignation() == null || dto.getDesignation().isBlank()) {
                throw new IllegalArgumentException("Designation is required for staff");
            }
        }
    }

    private String generateUniversityId(UserType userType, int registrationYear) {
        String yearCode = String.format("%02d", registrationYear % 100);
        String typeCode = userType == UserType.STUDENT ? "20" : "10";
        String prefix = "UNI" + yearCode + typeCode;

        String lastId = userRepository.findTopByUniversityIdStartingWithOrderByUniversityIdDesc(prefix)
                .map(User::getUniversityId)
                .orElse(null);

        int nextSequence = 1110;
        if (lastId != null && lastId.length() >= 4) {
            String tail = lastId.substring(lastId.length() - 4);
            try {
                nextSequence = Math.max(1110, Integer.parseInt(tail) + 1);
            } catch (NumberFormatException ignored) {
                nextSequence = 1110;
            }
        }

        return prefix + String.format("%04d", nextSequence);
    }

    private String cleanOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
