package com.smartlibrary.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartlibrary.entity.Book;
import com.smartlibrary.entity.Circulation;
import com.smartlibrary.entity.Reservation;
import com.smartlibrary.entity.User;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.CirculationRepository;
import com.smartlibrary.repository.ReservationRepository;
import com.smartlibrary.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIChatController {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;
    private final CirculationRepository circulationRepository;
    private final ObjectMapper objectMapper;

   
    public AIChatController(
            UserRepository userRepository,
            BookRepository bookRepository,
            ReservationRepository reservationRepository,
            CirculationRepository circulationRepository,
            ObjectMapper objectMapper) {

        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.reservationRepository = reservationRepository;
        this.circulationRepository = circulationRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestParam String message,
            Authentication authentication) {

        try {

            if (authentication == null) {

                return ResponseEntity
                        .status(401)
                        .body("Authentication required.");
            }

            if (message == null
                    || message.trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Message cannot be empty.");
            }

            User user =
                    userRepository
                            .findByEmail(
                                    authentication.getName()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "User not found."
                                    )
                            );

            List<Book> books =
                    bookRepository.findAll();

            List<Reservation> reservations =
                    reservationRepository
                            .findByUserId(user.getId());

            List<Circulation> circulations =
                    circulationRepository
                            .findByUserId(user.getId());

            StringBuilder context =
                    new StringBuilder();

            context.append(
                    "CURRENT LIBRARY DATA\n\n"
            );

            context.append(
                    "USER:\n"
            );

            context.append(
                    "Name: "
            ).append(
                    user.getName()
            ).append("\n");

            context.append(
                    "Email: "
            ).append(
                    user.getEmail()
            ).append("\n");

            context.append(
                    "Role: "
            ).append(
                    user.getRole()
            ).append("\n\n");

            context.append(
                    "BOOK CATALOG:\n"
            );

            for (Book book : books) {

                context.append(
                        "- ID: "
                ).append(
                        book.getId()
                ).append(
                        " | Title: "
                ).append(
                        book.getTitle()
                ).append(
                        " | Author: "
                ).append(
                        book.getAuthor()
                ).append(
                        " | Category: "
                ).append(
                        book.getCategory()
                ).append(
                        " | Available Copies: "
                ).append(
                        book.getAvailableCopies()
                ).append(
                        " | Total Copies: "
                ).append(
                        book.getTotalCopies()
                ).append("\n");
            }

            context.append(
                    "\nMY RESERVATIONS:\n"
            );

            if (reservations.isEmpty()) {

                context.append(
                        "No reservations.\n"
                );

            } else {

                for (Reservation reservation :
                        reservations) {

                    context.append(
                            "- Reservation ID: "
                    ).append(
                            reservation.getId()
                    ).append(
                            " | Book: "
                    ).append(
                            reservation.getBook()
                                    .getTitle()
                    ).append(
                            " | Status: "
                    ).append(
                            reservation.getStatus()
                    ).append(
                            " | Queue Position: "
                    ).append(
                            reservation.getQueuePosition()
                    ).append("\n");
                }
            }

            context.append(
                    "\nMY CIRCULATION HISTORY:\n"
            );

            if (circulations.isEmpty()) {

                context.append(
                        "No circulation history.\n"
                );

            } else {

                for (Circulation circulation :
                        circulations) {

                    context.append(
                            "- Circulation ID: "
                    ).append(
                            circulation.getId()
                    ).append(
                            " | Book: "
                    ).append(
                            circulation
                                    .getBookCopy()
                                    .getBook()
                                    .getTitle()
                    ).append(
                            " | Status: "
                    ).append(
                            circulation.getStatus()
                    ).append(
                            " | Issue Date: "
                    ).append(
                            circulation.getIssueDate()
                    ).append(
                            " | Due Date: "
                    ).append(
                            circulation.getDueDate()
                    ).append(
                            " | Return Date: "
                    ).append(
                            circulation.getReturnDate()
                    ).append("\n");
                }
            }

            String json =
                    objectMapper.writeValueAsString(
                            new AIRequest(
                                    message.trim(),
                                    user.getName(),
                                    user.getId(),
                                    context.toString()
                            )
                    );
                            System.out.println("===== AI LIBRARY CONTEXT =====");
System.out.println(context.toString());
System.out.println("===== END AI LIBRARY CONTEXT =====");
                   System.out.println("===== AI JSON SENT TO PYTHON =====");
System.out.println(json);
System.out.println("===== END AI JSON =====");
           HttpURLConnection connection =
        (HttpURLConnection)
                URI.create(
                        "http://127.0.0.1:8000/ai-chat"
                ).toURL().openConnection();

connection.setRequestMethod("POST");
connection.setRequestProperty(
        "Content-Type",
        "application/json"
);
connection.setRequestProperty(
        "Accept",
        "application/json"
);
connection.setDoOutput(true);
connection.setConnectTimeout(10000);
connection.setReadTimeout(120000);

byte[] requestBody =
        json.getBytes(
                java.nio.charset.StandardCharsets.UTF_8
        );

connection.setFixedLengthStreamingMode(
        requestBody.length
);

try (OutputStream outputStream =
             connection.getOutputStream()) {

    outputStream.write(requestBody);
    outputStream.flush();
}

int statusCode =
        connection.getResponseCode();

BufferedReader reader;

if (statusCode >= 200 && statusCode < 300) {

    reader =
            new BufferedReader(
                    new InputStreamReader(
                            connection.getInputStream(),
                            java.nio.charset.StandardCharsets.UTF_8
                    )
            );

} else {

    reader =
            new BufferedReader(
                    new InputStreamReader(
                            connection.getErrorStream(),
                            java.nio.charset.StandardCharsets.UTF_8
                    )
            );
}

StringBuilder responseBuilder =
        new StringBuilder();

String line;

while ((line = reader.readLine()) != null) {

    responseBuilder.append(line);
}

String responseBody =
        responseBuilder.toString();

System.out.println(
        "AI PYTHON STATUS: "
                + statusCode
);

System.out.println(
        "AI PYTHON RESPONSE: "
                + responseBody
);

if (statusCode != 200) {

    return ResponseEntity
            .status(502)
            .body(
                    "AI service unavailable: "
                            + responseBody
            );
}

if (responseBody.isBlank()) {

    return ResponseEntity
            .status(502)
            .body(
                    "AI service returned an empty response."
            );
}

JsonNode result = objectMapper.readTree(responseBody);

String reply = result.path("reply").asText();

List<java.util.Map<String, Object>> recommendedBooks =
        books.stream()
                .filter(book ->
                        reply.toLowerCase().contains(
                                book.getTitle().toLowerCase()
                        )
                )
                .map(book -> {

                    java.util.Map<String, Object> bookData =
                            new java.util.LinkedHashMap<>();

                    bookData.put("id", book.getId());
                    bookData.put("title", book.getTitle());
                    bookData.put("author", book.getAuthor());
                    bookData.put("category", book.getCategory());
                    bookData.put(
                            "coverImageUrl",
                            book.getCoverImageUrl()
                    );
                    bookData.put(
                            "availableCopies",
                            book.getAvailableCopies()
                    );
                    bookData.put(
                            "totalCopies",
                            book.getTotalCopies()
                    );

                    return bookData;
                })
                .toList();

java.util.Map<String, Object> response =
        new java.util.LinkedHashMap<>();

response.put("reply", reply);
response.put(
        "recommendedBooks",
        recommendedBooks
);

return ResponseEntity.ok(response);
        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "AI assistant failed: "
                                    + e.getMessage()
                    );
        }
    }

    public record AIRequest(
            String message,
            String userName,
            Long userId,
            String libraryContext
    ) {}
}