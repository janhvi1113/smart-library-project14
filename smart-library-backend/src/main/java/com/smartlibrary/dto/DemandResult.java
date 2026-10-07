package com.smartlibrary.dto;

public record DemandResult(
        Long bookId,
        String title,
        int circulationCount,
        int waitingReservations,
        int availableCopies,
        int demandScore,
        String demandLevel
) {
}