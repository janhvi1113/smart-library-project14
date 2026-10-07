package com.smartlibrary.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService =
                notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity
                    .status(401)
                    .body("Authentication required.");
        }

        try {

            List<NotificationResult> notifications =
                    notificationService
                            .getNotifications(
                                    authentication.getName()
                            );

            return ResponseEntity.ok(
                    notifications
            );

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}