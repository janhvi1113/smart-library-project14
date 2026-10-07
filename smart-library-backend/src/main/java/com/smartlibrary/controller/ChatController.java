package com.smartlibrary.controller;

import com.smartlibrary.entity.ChatMessage;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.ChatMessageRepository;
import com.smartlibrary.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatController(
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository) {

        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @RequestParam Long receiverId,
            @RequestParam String message,
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Message cannot be empty.");
            }

            User sender =
                    userRepository.findByEmail(
                            authentication.getName()
                    ).orElseThrow(() ->
                            new RuntimeException("Sender not found.")
                    );

            User receiver =
                    userRepository.findById(receiverId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Receiver not found."
                                    )
                            );

            ChatMessage chatMessage =
                    new ChatMessage();

            chatMessage.setSender(sender);
            chatMessage.setReceiver(receiver);
            chatMessage.setMessage(message.trim());
            chatMessage.setCreatedAt(LocalDateTime.now());
            chatMessage.setReadStatus(false);

            return ResponseEntity.ok(
                    chatMessageRepository.save(chatMessage)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyMessages(
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            User user =
                    userRepository.findByEmail(
                            authentication.getName()
                    ).orElseThrow(() ->
                            new RuntimeException("User not found.")
                    );

            List<ChatMessage> messages =
                    chatMessageRepository
                            .findBySenderIdOrReceiverIdOrderByCreatedAtAsc(
                                    user.getId(),
                                    user.getId()
                            );

            return ResponseEntity.ok(messages);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllMessages(
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            List<ChatMessage> messages =
                    chatMessageRepository
                            .findAllByOrderByCreatedAtAsc();

            return ResponseEntity.ok(messages);

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(
            Authentication authentication) {

        try {

            if (authentication == null) {
                return ResponseEntity.status(401)
                        .body("Authentication required.");
            }

            List<User> users =
                    userRepository.findAll()
                            .stream()
                            .filter(user ->
                                    "STUDENT".equals(user.getRole())
                            )
                            .toList();

            return ResponseEntity.ok(users);

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

            ChatMessage message =
                    chatMessageRepository.findById(id)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Message not found."
                                    )
                            );

            message.setReadStatus(true);

            return ResponseEntity.ok(
                    chatMessageRepository.save(message)
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());
        }
    }
}