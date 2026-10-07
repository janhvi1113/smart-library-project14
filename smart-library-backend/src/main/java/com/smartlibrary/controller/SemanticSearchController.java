package com.smartlibrary.controller;

import com.smartlibrary.semantic.SemanticSearchResult;
import com.smartlibrary.semantic.SemanticSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/semantic-search")

public class SemanticSearchController {

    private final SemanticSearchService semanticSearchService;

    public SemanticSearchController(
            SemanticSearchService semanticSearchService) {

        this.semanticSearchService =
                semanticSearchService;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam String query) {

        try {

            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest()
                        .body("Search query is required.");
            }

            List<SemanticSearchResult> results =
                    semanticSearchService.search(query);

            return ResponseEntity.ok(results);

        } catch (Exception e) {

            return ResponseEntity.internalServerError()
                    .body(
                            "Semantic search failed: "
                                    + e.getMessage()
                    );
        }
    }
}