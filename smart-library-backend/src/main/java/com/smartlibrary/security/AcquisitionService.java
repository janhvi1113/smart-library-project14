package com.smartlibrary.service;

import com.smartlibrary.dto.AcquisitionResult;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.Circulation;
import com.smartlibrary.entity.Reservation;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.CirculationRepository;
import com.smartlibrary.repository.ReservationRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AcquisitionService {

    private final BookRepository bookRepository;
    private final CirculationRepository circulationRepository;
    private final ReservationRepository reservationRepository;

    public AcquisitionService(
            BookRepository bookRepository,
            CirculationRepository circulationRepository,
            ReservationRepository reservationRepository) {

        this.bookRepository = bookRepository;
        this.circulationRepository = circulationRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<AcquisitionResult> getSuggestions() {

        List<AcquisitionResult> results = new ArrayList<>();

        List<Book> books = bookRepository.findAll();
        List<Circulation> circulations = circulationRepository.findAll();

        for (Book book : books) {

            int circulationCount = 0;
            int waitingReservations = 0;

            for (Circulation circulation : circulations) {

                if (circulation.getBookCopy() != null
                        && circulation.getBookCopy().getBook() != null
                        && circulation.getBookCopy().getBook().getId().equals(book.getId())) {

                    circulationCount++;
                }
            }

            List<Reservation> reservations =
                    reservationRepository.findByBookIdOrderByReservationDateAsc(book.getId());

            for (Reservation reservation : reservations) {

                if ("WAITING".equals(reservation.getStatus())) {
                    waitingReservations++;
                }
            }

            int availableCopies =
                    book.getAvailableCopies() == null
                            ? 0
                            : book.getAvailableCopies();

            int totalCopies =
                    book.getTotalCopies() == null
                            ? 0
                            : book.getTotalCopies();

            int demandScore =
                    (circulationCount * 2)
                            + (waitingReservations * 5)
                            + (availableCopies == 0 ? 5 : 0);

            String demandLevel;

            if (demandScore >= 15) {
                demandLevel = "HIGH";
            } else if (demandScore >= 7) {
                demandLevel = "MEDIUM";
            } else {
                demandLevel = "LOW";
            }

            int suggestedCopies = 0;
            String reason;

            if ("HIGH".equals(demandLevel)) {

                suggestedCopies =
                        Math.max(
                                2,
                                waitingReservations
                                        + (availableCopies == 0 ? 1 : 0)
                        );

                if (waitingReservations > 0 && availableCopies == 0) {

                    reason =
                            "High demand, no available copies and an active waiting queue.";

                } else if (availableCopies == 0) {

                    reason =
                            "High circulation demand with no available copies.";

                } else {

                    reason =
                            "High circulation demand indicates additional copies may be required.";
                }

            } else if ("MEDIUM".equals(demandLevel)) {

                if (waitingReservations > 0 || availableCopies == 0) {

                    suggestedCopies = 1;

                    if (waitingReservations > 0) {

                        reason =
                                "Moderate demand with an active reservation queue.";

                    } else {

                        reason =
                                "Moderate demand with no currently available copies.";
                    }

                } else {

                    suggestedCopies = 0;

                    reason =
                            "Moderate demand but current availability is sufficient.";
                }

            } else {

                suggestedCopies = 0;

                reason =
                        "Current demand does not indicate an immediate acquisition need.";
            }

            results.add(
                    new AcquisitionResult(
                            book.getId(),
                            book.getTitle(),
                            book.getAuthor(),
                            totalCopies,
                            availableCopies,
                            circulationCount,
                            waitingReservations,
                            demandScore,
                            demandLevel,
                            suggestedCopies,
                            reason
                    )
            );
        }

        results.sort(
                (a, b) ->
                        Integer.compare(
                                b.suggestedAdditionalCopies(),
                                a.suggestedAdditionalCopies()
                        )
        );

        return results;
    }
}