package com.smartlibrary.repository;

import com.smartlibrary.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySenderIdOrReceiverIdOrderByCreatedAtAsc(
            Long senderId,
            Long receiverId
    );

    List<ChatMessage> findAllByOrderByCreatedAtAsc();
}