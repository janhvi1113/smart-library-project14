package com.smartlibrary.semantic;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlibrary.entity.Book;
import com.smartlibrary.repository.BookRepository;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SemanticSearchService {

    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient =
        HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .build();

    private final String semanticServiceUrl =
            "http://127.0.0.1:8000/semantic-search";

    public SemanticSearchService(
            BookRepository bookRepository,
            ObjectMapper objectMapper) {

        this.bookRepository = bookRepository;
        this.objectMapper = objectMapper;
    }

    public List<SemanticSearchResult> search(String query) {

        if (query == null || query.isBlank()) {
            return new ArrayList<>();
        }

        List<Book> books = bookRepository.findAll();

        if (books.isEmpty()) {
            return new ArrayList<>();
        }

        try {

            List<Map<String, Object>> bookData =
                    new ArrayList<>();

            for (Book book : books) {

                Map<String, Object> data =
                        new HashMap<>();

                data.put("id", book.getId());
                data.put("isbn", book.getIsbn());
                data.put("title", book.getTitle());
                data.put("author", book.getAuthor());
                data.put("category", book.getCategory());
                data.put("description", book.getDescription());
                data.put("totalCopies", book.getTotalCopies());
                data.put("availableCopies", book.getAvailableCopies());

                bookData.add(data);
            }

            Map<String, Object> requestData =
                    new HashMap<>();

            requestData.put("query", query);
            requestData.put("books", bookData);

            String requestBody =
                    objectMapper.writeValueAsString(requestData);

            System.out.println(
                    "Sending semantic search request to Python..."
            );

            System.out.println(
                    "Request body length: "
                            + requestBody.length()
            );

            System.out.println(
                    "Request body: "
                            + requestBody
            );

          HttpRequest request =
        HttpRequest.newBuilder()
                .uri(URI.create(semanticServiceUrl))
                .version(HttpClient.Version.HTTP_1_1)
                .header(
                        "Content-Type",
                        "application/json"
                )
                .header(
                        "Accept",
                        "application/json"
                )
                .POST(
                        HttpRequest.BodyPublishers.ofString(
                                requestBody,
                                StandardCharsets.UTF_8
                        )
                )
                .build();

            HttpResponse<String> response =
                    httpClient.send(
                            request,
                            HttpResponse.BodyHandlers
                                    .ofString(
                                            StandardCharsets.UTF_8
                                    )
                    );

            System.out.println(
                    "Python semantic service status: "
                            + response.statusCode()
            );

            System.out.println(
                    "Python response: "
                            + response.body()
            );

            if (response.statusCode() != 200) {

                throw new RuntimeException(
                        "Semantic service returned HTTP "
                                + response.statusCode()
                                + ": "
                                + response.body()
                );
            }

            JsonNode root =
                    objectMapper.readTree(
                            response.body()
                    );

            JsonNode results =
                    root.get("results");

            List<SemanticSearchResult> searchResults =
                    new ArrayList<>();

            if (results != null && results.isArray()) {

                for (JsonNode result : results) {

                    JsonNode bookNode =
                            result.get("book");

                    double score =
                            result.get(
                                    "similarityScore"
                            ).asDouble();

                    Long bookId =
                            bookNode.get("id").asLong();

                    Book matchingBook =
                            books.stream()
                                    .filter(book ->
                                            book.getId()
                                                    .equals(bookId))
                                    .findFirst()
                                    .orElse(null);

                    if (matchingBook != null) {

                        searchResults.add(
                                new SemanticSearchResult(
                                        matchingBook,
                                        score
                                )
                        );
                    }
                }
            }

            return searchResults;

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Semantic search failed: "
                            + e.getMessage(),
                    e
            );
        }
    }
}