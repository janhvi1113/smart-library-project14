package com.smartlibrary.notification;

public record NotificationResult(
        String type,
        String title,
        String message,
        String status,
        Long referenceId
) {
}