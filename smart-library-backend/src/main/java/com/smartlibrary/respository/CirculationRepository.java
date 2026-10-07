package com.smartlibrary.repository;

import com.smartlibrary.entity.Circulation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CirculationRepository extends JpaRepository<Circulation, Long> {

    List<Circulation> findByUserId(Long userId);

    List<Circulation> findByBookCopyId(Long bookCopyId);

    List<Circulation> findByStatus(String status);
}