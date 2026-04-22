package com.campushub.smartcampus.dto;

import com.campushub.smartcampus.entity.User;
import com.campushub.smartcampus.enums.UserType;

import java.time.LocalDateTime;
import java.util.Locale;

public class AuthUserResponseDTO {

    private Long id;
    private String username;
    private String name;
    private String email;
    private String role;
    private String provider;
    private String providerId;
    private String profileImageUrl;
    private String universityId;
    private UserType userType;
    private Integer registrationYear;
    private String course;
    private Integer yearOfStudy;
    private String department;
    private String designation;
    private LocalDateTime createdAt;
    private boolean newUser;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public String getUniversityId() {
        return universityId;
    }

    public void setUniversityId(String universityId) {
        this.universityId = universityId;
    }

    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public Integer getRegistrationYear() {
        return registrationYear;
    }

    public void setRegistrationYear(Integer registrationYear) {
        this.registrationYear = registrationYear;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public Integer getYearOfStudy() {
        return yearOfStudy;
    }

    public void setYearOfStudy(Integer yearOfStudy) {
        this.yearOfStudy = yearOfStudy;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isNewUser() {
        return newUser;
    }

    public void setNewUser(boolean newUser) {
        this.newUser = newUser;
    }

    public static AuthUserResponseDTO fromEntity(User user, boolean newUser) {
        AuthUserResponseDTO dto = new AuthUserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getName() != null && !user.getName().isBlank()
                ? user.getName()
                : user.getEmail());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().toLowerCase(Locale.ROOT) : "user");
        dto.setProvider(user.getProvider());
        dto.setProviderId(user.getProviderId());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setUniversityId(user.getUniversityId());
        dto.setUserType(user.getUserType());
        dto.setRegistrationYear(user.getRegistrationYear());
        dto.setCourse(user.getCourse());
        dto.setYearOfStudy(user.getYearOfStudy());
        dto.setDepartment(user.getDepartment());
        dto.setDesignation(user.getDesignation());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setNewUser(newUser);
        return dto;
    }
}
