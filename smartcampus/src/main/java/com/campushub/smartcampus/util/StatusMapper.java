package com.campushub.smartcampus.util;

import com.campushub.smartcampus.enums.ResourceStatus;

public final class StatusMapper {

    private StatusMapper() {
    }

    public static ResourceStatus normalizeResourceStatus(String status) {
        if (status == null || status.isBlank()) {
            return ResourceStatus.ACTIVE;
        }

        return switch (status.trim().toUpperCase()) {
            case "AVAILABLE", "ACTIVE" -> ResourceStatus.ACTIVE;
            case "UNDER_MAINTENANCE" -> ResourceStatus.UNDER_MAINTENANCE;
            case "UNAVAILABLE", "OUT_OF_SERVICE" -> ResourceStatus.OUT_OF_SERVICE;
            default -> ResourceStatus.ACTIVE;
        };
    }

    public static String normalizeEquipmentStatus(String status) {
        if (status == null || status.isBlank()) {
            return "ACTIVE";
        }

        return switch (status.trim().toUpperCase()) {
            case "AVAILABLE", "ACTIVE" -> "ACTIVE";
            case "UNDER_MAINTENANCE" -> "UNDER_MAINTENANCE";
            case "UNAVAILABLE", "OUT_OF_SERVICE" -> "OUT_OF_SERVICE";
            default -> "ACTIVE";
        };
    }
}
