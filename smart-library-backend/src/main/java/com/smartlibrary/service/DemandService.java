package com.smartlibrary.service;

import com.smartlibrary.dto.DemandResult;
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
public class DemandService {

    private final BookRepository bookRepository;
    private final CirculationRepository circulationRepository;
    private final ReservationRepository reservationRepository;

    public DemandService(
            BookRepository bookRepository,
            CirculationRepository circulationRepository,
            ReservationRepository reservationRepository) {

        this.bookRepository = bookRepository;
        this.circulationRepository = circulationRepository;
        this.reservationRepository = reservationRepository;
    }

    public List<DemandResult> getDemandDashboard() {

        List<DemandResult> results = new ArrayList<>();

        List<Book> books = bookRepository.findAll();

        List<Circulation> circulations =
                circulationRepository.findAll();

        for (Book book : books) {

            int circulationCount = 0;
            int waitingReservations = 0;

            for (Circulation circulation : circulations) {

                if (circulation.getBookCopy() != null
                        && circulation.getBookCopy().getBook() != null
                        && circulation.getBookCopy()
                                .getBook()
                                .getId()
                                .equals(book.getId())) {

                    circulationCount++;
                }
            }

            List<Reservation> reservations =
                    reservationRepository
                            .findByBookIdOrderByReservationDateAsc(
                                    book.getId());

            for (Reservation reservation : reservations) {

                if ("WAITING".equals(reservation.getStatus())) {
                    waitingReservations++;
                }
            }

            int availableCopies =
                    book.getAvailableCopies() == null
                            ? 0
                            : book.getAvailableCopies();

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

            results.add(
                    new DemandResult(
                            book.getId(),
                            book.getTitle(),
                            circulationCount,
                            waitingReservations,
                            availableCopies,
                            demandScore,
                            demandLevel
                    )
            );
        }

        return results;
    }
}