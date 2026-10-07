package com.smartlibrary.semantic;

import com.smartlibrary.entity.Book;

public record SemanticSearchResult(
        Book book,
        double similarityScore
) {
}