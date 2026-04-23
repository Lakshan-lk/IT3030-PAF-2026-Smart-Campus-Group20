package com.campushub.smartcampus.service;

import com.campushub.smartcampus.dto.AdminUserCreateRequestDTO;
import com.campushub.smartcampus.dto.AdminUserResponseDTO;
import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.UserType;
import com.campushub.smartcampus.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
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
        normalizeTechnicianFields(dto);
        validateUniqueness(dto, null);
        validateTypeSpecificFields(dto, false);

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
        user.setUsername(cleanOptional(dto.getUsername()));
        user.setPassword(cleanOptional(dto.getPassword()));
        user.setProfession(cleanOptional(dto.getProfession()));
        user.setRole(dto.getRole() != null && !dto.getRole().trim().isEmpty() ? dto.getRole().trim() : "USER");

        User saved = userRepository.save(user);
        return AdminUserResponseDTO.fromEntity(saved);
    }

    public AdminUserResponseDTO updateTechnician(Long id, AdminUserCreateRequestDTO dto) {
        normalizeTechnicianFields(dto);
        validateTechnicianOnly(dto);
        validateUniqueness(dto, id);
        validateTypeSpecificFields(dto, true);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        ensureTechnician(user);

        user.setName(dto.getName().trim());
        user.setEmail(dto.getEmail().trim().toLowerCase(Locale.ROOT));
        user.setAge(dto.getAge());
        user.setAddress(dto.getAddress().trim());
        user.setPhone(dto.getPhone().trim());
        user.setRegistrationYear(dto.getRegistrationYear() != null ? dto.getRegistrationYear() : user.getRegistrationYear());
        user.setUsername(cleanOptional(dto.getUsername()));
        String nextPassword = cleanOptional(dto.getPassword());
        if (nextPassword != null) {
            user.setPassword(nextPassword);
        }
        user.setProfession(cleanOptional(dto.getProfession()));
        user.setRole("TECHNICIAN");
        user.setUserType(UserType.STAFF);
        user.setCourse(null);
        user.setYearOfStudy(null);
        user.setDepartment(null);
        user.setDesignation(null);

        User saved = userRepository.save(user);
        return AdminUserResponseDTO.fromEntity(saved);
    }

    public void deleteTechnician(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        ensureTechnician(user);
        userRepository.delete(user);
    }

    private void validateUniqueness(AdminUserCreateRequestDTO dto, Long existingUserId) {
        String email = dto.getEmail().trim().toLowerCase(Locale.ROOT);
        String phone = dto.getPhone().trim();

        boolean emailExists = existingUserId == null
                ? userRepository.existsByEmailIgnoreCase(email)
                : userRepository.existsByEmailIgnoreCaseAndIdNot(email, existingUserId);
        if (emailExists) {
            throw new IllegalArgumentException("Email is already in use");
        }
        boolean phoneExists = existingUserId == null
                ? userRepository.existsByPhone(phone)
                : userRepository.existsByPhoneAndIdNot(phone, existingUserId);
        if (phoneExists) {
            throw new IllegalArgumentException("Phone number is already in use");
        }

        String role = dto.getRole() != null ? dto.getRole().trim().toUpperCase(Locale.ROOT) : "USER";
        if ("TECHNICIAN".equals(role)) {
            if (dto.getUsername() == null || dto.getUsername().isBlank()) {
                throw new IllegalArgumentException("Username is required for technicians");
            }
            String username = dto.getUsername().trim().toLowerCase(Locale.ROOT);
            boolean usernameExists = existingUserId == null
                    ? userRepository.existsByUsernameIgnoreCase(username)
                    : userRepository.existsByUsernameIgnoreCaseAndIdNot(username, existingUserId);
            if (usernameExists) {
                throw new IllegalArgumentException("Username is already in use");
            }
        }
    }

    private void validateTypeSpecificFields(AdminUserCreateRequestDTO dto, boolean isUpdate) {
        String role = dto.getRole() != null ? dto.getRole().trim().toUpperCase(Locale.ROOT) : "USER";

        if ("TECHNICIAN".equals(role)) {
            if (dto.getUsername() == null || dto.getUsername().isBlank()) {
                throw new IllegalArgumentException("Username is required for technicians");
            }
            if (!isUpdate && (dto.getPassword() == null || dto.getPassword().isBlank())) {
                throw new IllegalArgumentException("Password is required for technicians");
            }
            if (dto.getProfession() == null || dto.getProfession().isBlank()) {
                throw new IllegalArgumentException("Profession is required for technicians");
            }
            return;
        }

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

    private void validateTechnicianOnly(AdminUserCreateRequestDTO dto) {
        String role = dto.getRole() != null ? dto.getRole().trim().toUpperCase(Locale.ROOT) : "";
        if (!"TECHNICIAN".equals(role)) {
            throw new IllegalArgumentException("This endpoint only supports technician accounts");
        }
    }

    private void ensureTechnician(User user) {
        if (user.getRole() == null || !"TECHNICIAN".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Only technician accounts can be modified here");
        }
    }

    private void normalizeTechnicianFields(AdminUserCreateRequestDTO dto) {
        if (dto.getRole() == null) {
            return;
        }

        String normalizedRole = dto.getRole().trim().toUpperCase(Locale.ROOT);
        dto.setRole(normalizedRole);

        if (!"TECHNICIAN".equals(normalizedRole)) {
            return;
        }

        dto.setUserType(UserType.STAFF);
        dto.setCourse(null);
        dto.setYearOfStudy(null);
        dto.setDepartment(null);
        dto.setDesignation(null);

        if (dto.getUsername() != null) {
            dto.setUsername(dto.getUsername().trim().toLowerCase(Locale.ROOT));
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
