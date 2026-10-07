package com.smartlibrary.controller;

import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.BookCopy;
import com.smartlibrary.entity.Reservation;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.BookCopyRepository;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.ReservationRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;

    public ReservationController(
            ReservationRepository reservationRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            BookCopyRepository bookCopyRepository) {

        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.bookCopyRepository = bookCopyRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReservation(
            @RequestParam Long bookId,
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.badRequest()
                    .body("Authenticated user not found");
        }

        Book book = bookRepository
                .findById(bookId)
                .orElse(null);

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book not found");
        }

        if (book.getAvailableCopies() != null
                && book.getAvailableCopies() > 0) {

            return ResponseEntity.badRequest()
                    .body("Book is currently available. Reservation is not required.");
        }

        List<Reservation> userReservations =
                reservationRepository.findByUserId(user.getId());

        for (Reservation existing : userReservations) {

            if (existing.getBook().getId().equals(bookId)
                    && ("WAITING".equals(existing.getStatus())
                    || "READY".equals(existing.getStatus()))) {

                return ResponseEntity.badRequest()
                        .body("You already have an active reservation for this book.");
            }
        }

        List<Reservation> allReservations =
                reservationRepository
                        .findByBookIdOrderByReservationDateAsc(bookId);

        int nextPosition = 1;

        for (Reservation existing : allReservations) {

            if ("WAITING".equals(existing.getStatus())
                    || "READY".equals(existing.getStatus())) {

                nextPosition++;
            }
        }

        Reservation reservation = new Reservation();

        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setReservationDate(LocalDateTime.now());
        reservation.setQueuePosition(nextPosition);
        reservation.setStatus("WAITING");

        return ResponseEntity.ok(
                reservationRepository.save(reservation));
    }

    @PostMapping("/fulfill-next/{bookId}")
    public ResponseEntity<?> fulfillNextReservation(
            @PathVariable Long bookId) {

        Book book = bookRepository
                .findById(bookId)
                .orElse(null);

        if (book == null) {
            return ResponseEntity.badRequest()
                    .body("Book not found");
        }

        List<Reservation> waitingReservations =
                reservationRepository
                        .findByBookIdAndStatusOrderByReservationDateAsc(
                                bookId,
                                "WAITING");

        if (waitingReservations.isEmpty()) {
            return ResponseEntity.ok(
                    "No waiting reservations for this book");
        }

        BookCopy availableCopy = null;

        List<BookCopy> copies =
                bookCopyRepository.findByBookId(bookId);

        for (BookCopy copy : copies) {

            if ("AVAILABLE".equals(copy.getStatus())) {
                availableCopy = copy;
                break;
            }
        }

        if (availableCopy == null) {
            return ResponseEntity.badRequest()
                    .body("No available physical copy for reservation");
        }

        Reservation nextReservation =
                waitingReservations.get(0);

        availableCopy.setStatus("HELD");

        nextReservation.setHeldCopy(availableCopy);
        nextReservation.setStatus("READY");
        nextReservation.setFulfilledDate(LocalDateTime.now());

        if (book.getAvailableCopies() != null
                && book.getAvailableCopies() > 0) {

            book.setAvailableCopies(
                    book.getAvailableCopies() - 1);
        }

        bookCopyRepository.save(availableCopy);
        bookRepository.save(book);

        return ResponseEntity.ok(
                reservationRepository.save(nextReservation));
    }

    @GetMapping("/book/{bookId}")
   
    public List<Reservation> getBookQueue(
            @PathVariable Long bookId) {

        return reservationRepository
                .findByBookIdOrderByReservationDateAsc(bookId);
    }

   @GetMapping("/user/{userId}")
public ResponseEntity<?> getUserReservations(
        @PathVariable Long userId,
        Authentication authentication) {

    System.out.println(
            "========== RESERVATION API START =========="
    );

    System.out.println(
            "REQUESTED USER ID: " + userId
    );

    System.out.println(
            "AUTHENTICATION: " + authentication
    );

    if (authentication == null) {

        System.out.println(
                "AUTHENTICATION IS NULL"
        );

        return ResponseEntity
                .status(401)
                .body("Authentication required.");
    }

    String email =
            authentication.getName();

    System.out.println(
            "AUTH EMAIL: " + email
    );

    User loggedInUser =
            userRepository
                    .findByEmail(email)
                    .orElse(null);

    if (loggedInUser == null) {

        System.out.println(
                "USER NOT FOUND"
        );

        return ResponseEntity
                .status(401)
                .body("Authenticated user not found.");
    }

    System.out.println(
            "LOGGED USER ID: " +
            loggedInUser.getId()
    );

    boolean librarian =
            authentication
                    .getAuthorities()
                    .stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(
                            "ROLE_LIBRARIAN"::equals
                    );

    System.out.println(
            "IS LIBRARIAN: " + librarian
    );

    if (!librarian
            && !loggedInUser
                    .getId()
                    .equals(userId)) {

        System.out.println(
                "ACCESS DENIED"
        );

        return ResponseEntity
                .status(403)
                .body(
                        "You can only view your own reservations."
                );
    }

    List<Reservation> result =
            reservationRepository
                    .findByUserId(userId);

    System.out.println(
            "RESERVATIONS FOUND: " +
            result.size()
    );

    for (Reservation reservation : result) {

        System.out.println(
                "RESERVATION ID: " +
                reservation.getId() +
                " | BOOK ID: " +
                reservation.getBook().getId() +
                " | STATUS: " +
                reservation.getStatus()
        );
    }

    System.out.println(
            "========== RESERVATION API END =========="
    );

    return ResponseEntity.ok(result);
}
@GetMapping("/debug-user/{userId}")
public ResponseEntity<String> debugUser(
        @PathVariable Long userId,
        Authentication authentication) {

    System.out.println(
            "######## DEBUG RESERVATION CONTROLLER REACHED ########"
    );

    System.out.println(
            "USER ID = " + userId
    );

    System.out.println(
            "AUTH = " +
            (authentication == null
                    ? "NULL"
                    : authentication.getName())
    );

    return ResponseEntity.ok(
            "RESERVATION CONTROLLER WORKS | USER=" + userId
    );
}
}