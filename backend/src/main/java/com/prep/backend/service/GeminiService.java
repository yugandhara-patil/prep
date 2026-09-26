package com.prep.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();

    public String generateQuestion(String prompt) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + "gemini-3.8-flash:generateContent";

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        // Try Gemini up to 3 times
        for (int attempt = 1; attempt <= 3; attempt++) {

            try {

                Map response = restClient.post()
                        .uri(url)
                        .header("x-goog-api-key", apiKey)
                        .header("Content-Type", "application/json")
                        .body(body)
                        .retrieve()
                        .body(Map.class);

                return extractText(response);

            } catch (HttpServerErrorException.ServiceUnavailable exception) {

                // Gemini returned 503 - temporarily unavailable
                if (attempt == 3) {
                    throw new RuntimeException(
                            "Gemini is temporarily unavailable. Please try again.",
                            exception
                    );
                }

                try {
                    // Wait 2 seconds before trying again
                    Thread.sleep(2000);
                } catch (InterruptedException interruptedException) {

                    Thread.currentThread().interrupt();

                    throw new RuntimeException(
                            "Gemini request was interrupted",
                            interruptedException
                    );
                }
            }
        }

        throw new RuntimeException(
                "Unable to generate interview question"
        );
    }

    private String extractText(Map response) {

        List candidates = (List) response.get("candidates");

        Map candidate = (Map) candidates.get(0);

        Map content = (Map) candidate.get("content");

        List parts = (List) content.get("parts");

        Map part = (Map) parts.get(0);

        return part.get("text").toString().trim();
    }
}