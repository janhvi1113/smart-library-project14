package com.smartlibrary.repository;

import com.smartlibrary.entity.Reminder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserIdOrderByCreatedAtDesc(Long userId);
}