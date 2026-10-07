package com.smartlibrary.repository;

import com.smartlibrary.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByBookIdOrderByReservationDateAsc(Long bookId);

    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByBookIdAndStatusOrderByReservationDateAsc(
            Long bookId, String status);
}