package com.smartlibrary.controller;

import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-management")
public class BookManagementController {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public BookManagementController(
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository) {
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    @PostMapping("/books")
    public ResponseEntity<?> addBook(
            @RequestBody Book book,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("Authentication required.");
            }

            if (book.getIsbn() == null || book.getIsbn().isBlank()
                    || book.getTitle() == null || book.getTitle().isBlank()) {
                return ResponseEntity.badRequest()
                        .body("ISBN and title are required.");
            }

            if (bookRepository.findByIsbn(book.getIsbn()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body("A book with this ISBN already exists.");
            }

            if (book.getTotalCopies() < 0) {
                book.setTotalCopies(0);
            }

            book.setAvailableCopies(book.getTotalCopies());

            Book savedBook = bookRepository.save(book);

            return ResponseEntity.ok(savedBook);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/books/{bookId}/copies")
    public ResponseEntity<?> addCopies(
            @PathVariable Long bookId,
            @RequestParam int quantity,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("Authentication required.");
            }

            if (quantity <= 0) {
                return ResponseEntity.badRequest()
                        .body("Quantity must be greater than zero.");
            }

            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found."));

            List<BookCopy> existingCopies =
                    bookCopyRepository.findByBookId(bookId);

            int nextNumber = existingCopies.size() + 1;

            for (int i = 0; i < quantity; i++) {

                BookCopy copy = new BookCopy();

                copy.setBook(book);
                copy.setCopyCode(
                        book.getIsbn() + "-COPY-" + (nextNumber + i)
                );
                copy.setStatus("AVAILABLE");

                bookCopyRepository.save(copy);
            }

            book.setTotalCopies(book.getTotalCopies() + quantity);
            book.setAvailableCopies(book.getAvailableCopies() + quantity);

            bookRepository.save(book);

            return ResponseEntity.ok(
                    quantity + " copy/copies added successfully."
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/books/{bookId}")
    public ResponseEntity<?> updateBook(
            @PathVariable Long bookId,
            @RequestBody Book updatedBook,
            Authentication authentication) {

        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body("Authentication required.");
            }

            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Book not found."));

            if (updatedBook.getTitle() != null) {
                book.setTitle(updatedBook.getTitle());
            }

            if (updatedBook.getAuthor() != null) {
                book.setAuthor(updatedBook.getAuthor());
            }

            if (updatedBook.getCategory() != null) {
                book.setCategory(updatedBook.getCategory());
            }

            if (updatedBook.getDescription() != null) {
                book.setDescription(updatedBook.getDescription());
            }

            Book savedBook = bookRepository.save(book);

            return ResponseEntity.ok(savedBook);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}