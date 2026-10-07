package com.smartlibrary.repository;

import com.smartlibrary.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookCopyRepository
        extends JpaRepository<BookCopy, Long> {

    Optional<BookCopy> findByCopyCode(String copyCode);

    List<BookCopy> findByBookId(Long bookId);

    List<BookCopy> findByStatus(String status);
}