package com.smartlibrary.controller;

import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookCopyController {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookCopyController(BookRepository bookRepository,
                              BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    @PostMapping("/{bookId}/copies")
    public ResponseEntity<BookCopy> addBookCopy(
            @PathVariable Long bookId,
            @RequestBody BookCopy bookCopy) {

        return bookRepository.findById(bookId)
                .map(book -> {
                    bookCopy.setBook(book);
                    bookCopy.setStatus("AVAILABLE");
                    return ResponseEntity.ok(bookCopyRepository.save(bookCopy));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{bookId}/copies")
    public ResponseEntity<List<BookCopy>> getBookCopies(
            @PathVariable Long bookId) {

        if (!bookRepository.existsById(bookId)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(bookCopyRepository.findByBookId(bookId));
    }
}