package com.smartlibrary.controller;

import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.Circulation;
import com.smartlibrary.entity.Reservation;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.CirculationRepository;
import com.smartlibrary.repository.ReservationRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/circulation")
public class CirculationController {

    private final CirculationRepository circulationRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;

    public CirculationController(
            CirculationRepository circulationRepository,
            UserRepository userRepository,
            BookCopyRepository bookCopyRepository,
            BookRepository bookRepository,
            ReservationRepository reservationRepository) {

        this.circulationRepository = circulationRepository;
        this.userRepository = userRepository;
        this.bookCopyRepository = bookCopyRepository;
        this.bookRepository = bookRepository;
        this.reservationRepository = reservationRepository;
    }

    private boolean hasRole(
            Authentication authentication,
            String role) {

        return authentication
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(
                        ("ROLE_" + role)::equals
                );
    }

    @PostMapping("/issue")
    @Transactional
    public ResponseEntity<?> issueBook(
            @RequestParam Long userId,
            @RequestParam Long bookCopyId,
            @RequestParam String dueDate,
            @RequestParam(required = false) Long reservationId,
            Authentication authentication) {

        if (!hasRole(authentication, "LIBRARIAN")) {
            return ResponseEntity.status(403)
                    .body("Only librarians can issue books.");
        }

        User user = userRepository
                .findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("User not found.");
        }

        BookCopy copy = bookCopyRepository
                .findById(bookCopyId)
                .orElse(null);

        if (copy == null) {
            return ResponseEntity.badRequest()
                    .body("Book copy not found.");
        }

        Book book = copy.getBook();

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book information not found.");
        }

        if (reservationId != null) {

            Reservation reservation =
                    reservationRepository
                            .findById(reservationId)
                            .orElse(null);

            if (reservation == null) {
                return ResponseEntity.badRequest()
                        .body("Reservation not found.");
            }

            if (!"READY".equals(
                    reservation.getStatus())) {

                return ResponseEntity.badRequest()
                        .body("Reservation is not ready for collection.");
            }

            if (!reservation.getUser()
                    .getId()
                    .equals(userId)) {

                return ResponseEntity.badRequest()
                        .body("Reservation does not belong to this student.");
            }

            if (reservation.getHeldCopy() == null
                    || !reservation.getHeldCopy()
                    .getId()
                    .equals(bookCopyId)) {

                return ResponseEntity.badRequest()
                        .body("Selected copy does not match the held reservation copy.");
            }

            if (!"HELD".equals(
                    copy.getStatus())) {

                return ResponseEntity.badRequest()
                        .body("This reserved copy is not currently held.");
            }

            Circulation circulation =
                    new Circulation();

            circulation.setUser(user);
            circulation.setBookCopy(copy);
            circulation.setIssueDate(
                    LocalDate.now());
            circulation.setDueDate(
                    LocalDate.parse(dueDate));
            circulation.setStatus(
                    "ISSUED");

            copy.setStatus("ISSUED");

            reservation.setStatus(
                    "FULFILLED");

            reservation.setFulfilledDate(
                    LocalDateTime.now());

            bookCopyRepository.save(copy);
            reservationRepository.save(reservation);

            return ResponseEntity.ok(
                    circulationRepository.save(
                            circulation));
        }

        if (!"AVAILABLE".equals(
                copy.getStatus())) {

            return ResponseEntity.badRequest()
                    .body("This physical copy is not available.");
        }

        if (book.getAvailableCopies() == null
                || book.getAvailableCopies() <= 0) {

            return ResponseEntity.badRequest()
                    .body("No available copies for this book.");
        }

        List<Circulation> userCirculations =
                circulationRepository
                        .findByUserId(userId);

        for (Circulation circulation :
                userCirculations) {

            if ("ISSUED".equals(
                    circulation.getStatus())
                    && circulation.getBookCopy() != null
                    && circulation.getBookCopy()
                    .getBook() != null
                    && circulation.getBookCopy()
                    .getBook()
                    .getId()
                    .equals(book.getId())) {

                return ResponseEntity.badRequest()
                        .body(
                                "This student already has this book issued."
                        );
            }
        }

        Circulation circulation =
                new Circulation();

        circulation.setUser(user);
        circulation.setBookCopy(copy);
        circulation.setIssueDate(
                LocalDate.now());
        circulation.setDueDate(
                LocalDate.parse(dueDate));
        circulation.setStatus(
                "ISSUED");

        copy.setStatus("ISSUED");

        book.setAvailableCopies(
                book.getAvailableCopies() - 1);

        bookCopyRepository.save(copy);
        bookRepository.save(book);

        return ResponseEntity.ok(
                circulationRepository.save(
                        circulation));
    }

    @PostMapping("/borrow")
    @Transactional
    public ResponseEntity<?> borrowBook(
            @RequestParam Long bookId,
            Authentication authentication) {

        if (!hasRole(authentication, "STUDENT")) {
            return ResponseEntity.status(403)
                    .body("Only students can borrow books using this option.");
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body("Authenticated user not found.");
        }

        Book book =
                bookRepository
                        .findById(bookId)
                        .orElse(null);

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book not found.");
        }

        if (book.getAvailableCopies() == null
                || book.getAvailableCopies() <= 0) {

            return ResponseEntity.badRequest()
                    .body(
                            "This book is currently unavailable. Please reserve it."
                    );
        }

        List<Circulation> userCirculations =
                circulationRepository
                        .findByUserId(user.getId());

        for (Circulation circulation :
                userCirculations) {

            if ("ISSUED".equals(
                    circulation.getStatus())
                    && circulation.getBookCopy() != null
                    && circulation.getBookCopy()
                    .getBook() != null
                    && circulation.getBookCopy()
                    .getBook()
                    .getId()
                    .equals(bookId)) {

                return ResponseEntity.badRequest()
                        .body(
                                "You already have this book issued."
                        );
            }
        }

        List<BookCopy> copies =
                bookCopyRepository
                        .findByBookId(bookId);

        BookCopy availableCopy = null;

        for (BookCopy copy : copies) {

            if ("AVAILABLE".equals(
                    copy.getStatus())) {

                availableCopy = copy;
                break;
            }
        }

        if (availableCopy == null) {
            return ResponseEntity.badRequest()
                    .body(
                            "No available physical copy found."
                    );
        }

        Circulation circulation =
                new Circulation();

        circulation.setBookCopy(
                availableCopy);

        circulation.setUser(user);

        circulation.setIssueDate(
                LocalDate.now());

        circulation.setDueDate(
                LocalDate.now().plusDays(7));

        circulation.setStatus(
                "ISSUED");

        availableCopy.setStatus(
                "ISSUED");

        book.setAvailableCopies(
                book.getAvailableCopies() - 1);

        bookCopyRepository.save(
                availableCopy);

        bookRepository.save(book);

        return ResponseEntity.ok(
                circulationRepository.save(
                        circulation));
    }

    @PostMapping("/return/{circulationId}")
    @Transactional
    public ResponseEntity<?> returnBook(
            @PathVariable Long circulationId,
            Authentication authentication) {

        if (!hasRole(authentication, "LIBRARIAN")) {
            return ResponseEntity.status(403)
                    .body(
                            "Only librarians can use this return endpoint."
                    );
        }

        return processReturn(
                circulationId);
    }

    @PostMapping("/return/student/{circulationId}")
    @Transactional
    public ResponseEntity<?> returnStudentBook(
            @PathVariable Long circulationId,
            Authentication authentication) {

        if (!hasRole(authentication, "STUDENT")) {
            return ResponseEntity.status(403)
                    .body(
                            "Only students can use this return endpoint."
                    );
        }

        String email =
                authentication.getName();

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {
            return ResponseEntity.status(401)
                    .body(
                            "Authenticated user not found."
                    );
        }

        Circulation circulation =
                circulationRepository
                        .findById(circulationId)
                        .orElse(null);

        if (circulation == null) {
            return ResponseEntity.badRequest()
                    .body(
                            "Circulation record not found."
                    );
        }

        if (circulation.getUser() == null
                || !circulation.getUser()
                .getId()
                .equals(user.getId())) {

            return ResponseEntity.status(403)
                    .body(
                            "You can only return books issued to you."
                    );
        }

        return processReturn(
                circulationId);
    }

    private ResponseEntity<?> processReturn(
            Long circulationId) {

        Circulation circulation =
                circulationRepository
                        .findById(circulationId)
                        .orElse(null);

        if (circulation == null) {
            return ResponseEntity.badRequest()
                    .body(
                            "Circulation record not found."
                    );
        }

        if (!"ISSUED".equals(
                circulation.getStatus())) {

            return ResponseEntity.badRequest()
                    .body(
                            "This book has already been returned."
                    );
        }

        BookCopy copy =
                circulation.getBookCopy();

        if (copy == null) {
            return ResponseEntity.badRequest()
                    .body(
                            "Book copy not found."
                    );
        }

        Book book =
                copy.getBook();

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body(
                            "Book not found."
                    );
        }

        circulation.setReturnDate(
                LocalDate.now());

        circulation.setStatus(
                "RETURNED");

        copy.setStatus(
                "AVAILABLE");

        int currentAvailable =
                book.getAvailableCopies() == null
                        ? 0
                        : book.getAvailableCopies();

        book.setAvailableCopies(
                currentAvailable + 1);

        bookCopyRepository.save(copy);
        bookRepository.save(book);
        circulationRepository.save(
                circulation);

        fulfillNextWaitingReservation(
                book);

        return ResponseEntity.ok(
                circulationRepository.findById(
                        circulationId
                ).orElse(circulation)
        );
    }

    private void fulfillNextWaitingReservation(
            Book book) {

        List<Reservation> waitingReservations =
                reservationRepository
                        .findByBookIdAndStatusOrderByReservationDateAsc(
                                book.getId(),
                                "WAITING"
                        );

        if (waitingReservations.isEmpty()) {
            return;
        }

        List<BookCopy> copies =
                bookCopyRepository
                        .findByBookId(book.getId());

        BookCopy availableCopy = null;

        for (BookCopy copy : copies) {

            if ("AVAILABLE".equals(
                    copy.getStatus())) {

                availableCopy = copy;
                break;
            }
        }

        if (availableCopy == null) {
            return;
        }

        Reservation nextReservation =
                waitingReservations.get(0);

        availableCopy.setStatus(
                "HELD");

        nextReservation.setHeldCopy(
                availableCopy);

        nextReservation.setStatus(
                "READY");

        nextReservation.setFulfilledDate(
                LocalDateTime.now());

        if (book.getAvailableCopies() != null
                && book.getAvailableCopies() > 0) {

            book.setAvailableCopies(
                    book.getAvailableCopies() - 1);
        }

        bookCopyRepository.save(
                availableCopy);

        reservationRepository.save(
                nextReservation);

        bookRepository.save(book);
    }

    @GetMapping
    public ResponseEntity<?> getAllCirculation(
            Authentication authentication) {

        if (!hasRole(authentication, "LIBRARIAN")) {
            return ResponseEntity.status(403)
                    .body(
                            "Only librarians can view all circulation records."
                    );
        }

        return ResponseEntity.ok(
                circulationRepository.findAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserCirculation(
            @PathVariable Long userId,
            Authentication authentication) {

        String email =
                authentication.getName();

        User loggedInUser =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (loggedInUser == null) {
            return ResponseEntity.status(401)
                    .body(
                            "Authenticated user not found."
                    );
        }

        boolean librarian =
                hasRole(
                        authentication,
                        "LIBRARIAN");

        if (!librarian
                && !loggedInUser
                .getId()
                .equals(userId)) {

            return ResponseEntity.status(403)
                    .body(
                            "You can only view your own circulation history."
                    );
        }

        return ResponseEntity.ok(
                circulationRepository
                        .findByUserId(userId));
    }
}