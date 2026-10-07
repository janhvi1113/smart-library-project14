package com.smartlibrary.dto;

public record AcquisitionResult(
        Long bookId,
        String title,
        String author,
        int totalCopies,
        int availableCopies,
        int circulationCount,
        int waitingReservations,
        int demandScore,
        String demandLevel,
        int suggestedAdditionalCopies,
        String recommendationReason
) {
}