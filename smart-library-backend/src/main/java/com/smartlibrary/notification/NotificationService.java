package com.smartlibrary.notification;

import com.smartlibrary.entity.Circulation;
import com.smartlibrary.entity.Reservation;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.CirculationRepository;
import com.smartlibrary.repository.ReservationRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private final UserRepository userRepository;
    private final CirculationRepository circulationRepository;
    private final ReservationRepository reservationRepository;

    public NotificationService(
            UserRepository userRepository,
            CirculationRepository circulationRepository,
            ReservationRepository reservationRepository) {

        this.userRepository = userRepository;
        this.circulationRepository = circulationRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<NotificationResult> getNotifications(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElse(null);

        if (user == null) {
            throw new RuntimeException(
                    "Authenticated user not found."
            );
        }

        List<NotificationResult> notifications =
                new ArrayList<>();

        List<Circulation> circulations =
                circulationRepository
                        .findByUserId(user.getId());

        LocalDate today = LocalDate.now();

        for (Circulation circulation : circulations) {

            if (!"ISSUED".equals(
                    circulation.getStatus())) {
                continue;
            }

            if (circulation.getDueDate() == null) {
                continue;
            }

            String bookTitle = "Book";

            if (circulation.getBookCopy() != null
                    && circulation.getBookCopy().getBook() != null
                    && circulation.getBookCopy()
                    .getBook().getTitle() != null) {

                bookTitle = circulation
                        .getBookCopy()
                        .getBook()
                        .getTitle();
            }

            if (circulation.getDueDate()
                    .isBefore(today)) {

                long daysOverdue =
                        java.time.temporal.ChronoUnit.DAYS
                                .between(
                                        circulation.getDueDate(),
                                        today
                                );

                notifications.add(
                        new NotificationResult(
                                "OVERDUE",
                                "Book Overdue",
                                "\"" + bookTitle
                                        + "\" is overdue by "
                                        + daysOverdue
                                        + " day"
                                        + (daysOverdue == 1
                                        ? ""
                                        : "s")
                                        + ". Please return it.",
                                "URGENT",
                                circulation.getId()
                        )
                );

            } else if (!circulation.getDueDate()
                    .isBefore(today)
                    && !circulation.getDueDate()
                    .isAfter(today.plusDays(2))) {

                long daysLeft =
                        java.time.temporal.ChronoUnit.DAYS
                                .between(
                                        today,
                                        circulation.getDueDate()
                                );

                String message;

                if (daysLeft == 0) {
                    message =
                            "\"" + bookTitle
                                    + "\" is due today. "
                                    + "Please return it on time.";
                } else {
                    message =
                            "\"" + bookTitle
                                    + "\" is due in "
                                    + daysLeft
                                    + " day"
                                    + (daysLeft == 1
                                    ? ""
                                    : "s")
                                    + ".";
                }

                notifications.add(
                        new NotificationResult(
                                "DUE_SOON",
                                "Book Due Soon",
                                message,
                                "WARNING",
                                circulation.getId()
                        )
                );
            }
        }

        List<Reservation> reservations =
                reservationRepository.findAll();

        for (Reservation reservation : reservations) {

            if (reservation.getUser() == null
                    || !reservation.getUser()
                    .getId()
                    .equals(user.getId())) {
                continue;
            }

            if (!"READY".equals(
                    reservation.getStatus())) {
                continue;
            }

            String bookTitle = "Book";

            if (reservation.getBook() != null
                    && reservation.getBook().getTitle() != null) {

                bookTitle =
                        reservation.getBook().getTitle();
            }

            notifications.add(
                    new NotificationResult(
                            "RESERVATION_READY",
                            "Reservation Ready",
                            "\"" + bookTitle
                                    + "\" is ready for collection.",
                            "SUCCESS",
                            reservation.getId()
                    )
            );
        }

        return notifications;
    }
}