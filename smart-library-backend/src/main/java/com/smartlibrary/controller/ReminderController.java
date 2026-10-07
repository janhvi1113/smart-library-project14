package com.smartlibrary.controller;

import com.smartlibrary.entity.Reminder;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.ReminderRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;

    public ReminderController(
            ReminderRepository reminderRepository,
            UserRepository userRepository) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendReminder(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String message,
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            User student = userRepository.findById(userId)
                    .orElseThrow(() ->
                            new RuntimeException("Student not found."));

            Reminder reminder = new Reminder();

            reminder.setUser(student);
            reminder.setTitle(title);
            reminder.setMessage(message);
            reminder.setType("LIBRARIAN");
            reminder.setCreatedAt(LocalDateTime.now());
            reminder.setReadStatus(false);

            Reminder saved =
                    reminderRepository.save(reminder);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyReminders(
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            String email =
                    authentication.getName();

            User user =
                    userRepository.findByEmail(email)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User not found."));

            List<Reminder> reminders =
                    reminderRepository
                            .findByUserIdOrderByCreatedAtDesc(
                                    user.getId());

            return ResponseEntity.ok(reminders);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            Reminder reminder =
                    reminderRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Reminder not found."));

            reminder.setReadStatus(true);

            return ResponseEntity.ok(
                    reminderRepository.save(reminder));

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}