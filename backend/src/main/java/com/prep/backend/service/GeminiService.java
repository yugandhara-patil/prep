package com.prep.backend.service;

import java.util.Base64;
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

    // =========================================================
    // GENERATE NORMAL INTERVIEW QUESTION
    // =========================================================

    public String generateQuestion(String prompt) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + "gemini-3.5-flash-lite:generateContent";

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                )
        );

        for (int attempt = 1; attempt <= 4; attempt++) {

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

                if (attempt == 4) {
                    throw new RuntimeException(
                            "Gemini is temporarily unavailable. Please try again.",
                            exception
                    );
                }

                sleepBeforeRetry(attempt);
            }
        }

        throw new RuntimeException("Unable to generate interview question");
    }


    // =========================================================
    // GENERATE STRUCTURED INTERVIEW RESPONSE
    // =========================================================

    public String generateInterviewResponse(String prompt) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + "gemini-3.5-flash-lite:generateContent";

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        // Retry temporary Gemini 503 errors.
        // If Gemini remains unavailable, return a valid fallback
        // so a temporary outage does not turn into HTTP 500.
        for (int attempt = 1; attempt <= 4; attempt++) {

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

                System.err.println(
                        "Gemini 503 during live interview. Attempt "
                                + attempt + "/4"
                );

                if (attempt == 4) {

                    return """
                            {
                              "evaluation": "PARTIALLY_CORRECT",
                              "feedback": "Let's continue.",
                              "nextQuestion": "Could you tell me a little more about that?"
                            }
                            """;
                }

                sleepBeforeRetry(attempt);
            }
        }

        return """
                {
                  "evaluation": "PARTIALLY_CORRECT",
                  "feedback": "Let's continue.",
                  "nextQuestion": "Could you tell me a little more about that?"
                }
                """;
    }


    // =========================================================
    // GENERATE PRACTICE QUESTIONS
    // =========================================================

    public String generatePracticeQuestions(String prompt) {

        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                + "gemini-3.5-flash-lite:generateContent";

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", prompt)
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

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

                if (attempt == 3) {

                    throw new RuntimeException(
                            "Gemini practice question service is temporarily unavailable. Please try again.",
                            exception
                    );
                }

                try {

                    Thread.sleep(1500);

                } catch (InterruptedException interruptedException) {

                    Thread.currentThread().interrupt();

                    throw new RuntimeException(
                            "Gemini practice question request was interrupted",
                            interruptedException
                    );
                }
            }
        }

        throw new RuntimeException(
                "Unable to generate practice questions"
        );
    }


    // =========================================================
    // SHORT RETRY DELAY FOR LIVE INTERVIEW
    // =========================================================

    private void sleepBeforeRetry(int attempt) {

        long delay;

        switch (attempt) {
            case 1 -> delay = 700;
            case 2 -> delay = 1200;
            case 3 -> delay = 2000;
            default -> delay = 0;
        }

        if (delay == 0) {
            return;
        }

        try {

            Thread.sleep(delay);

        } catch (InterruptedException interruptedException) {

            Thread.currentThread().interrupt();

            throw new RuntimeException(
                    "Gemini request was interrupted",
                    interruptedException
            );
        }
    }


    // =========================================================
    // EXTRACT GEMINI TEXT
    // =========================================================

    private String extractText(Map response) {

        List candidates =
                (List) response.get("candidates");

        Map candidate =
                (Map) candidates.get(0);

        Map content =
                (Map) candidate.get("content");

        List parts =
                (List) content.get("parts");

        Map part =
                (Map) parts.get(0);

        return part.get("text")
                .toString()
                .trim();
    }

    // =========================================================
    // SYNTHESIZE SPEECH (CONSISTENT CLOUD TTS FOR MAYA)
    // =========================================================

    public byte[] synthesizeSpeech(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new IllegalArgumentException("Text for speech synthesis cannot be empty.");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of(
                                "parts", List.of(
                                        Map.of("text", text.trim())
                                )
                        )
                ),
                "generationConfig", Map.of(
                        "responseModalities", List.of("AUDIO"),
                        "speechConfig", Map.of(
                                "voiceConfig", Map.of(
                                        "prebuiltVoiceConfig", Map.of(
                                                "voiceName", "Kore"
                                        )
                                )
                        )
                )
        );

        try {
            Map response = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            return extractWavAudio(response);
        } catch (Exception ex) {
            System.err.println("Gemini TTS synthesis failed: " + ex.getMessage());
            throw new RuntimeException("Gemini TTS synthesis failed: " + ex.getMessage(), ex);
        }
    }

    private byte[] extractWavAudio(Map response) {
        if (response == null || !response.containsKey("candidates")) {
            throw new RuntimeException("Invalid response from Gemini TTS service");
        }

        List candidates = (List) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new RuntimeException("No candidates returned by Gemini TTS");
        }

        Map candidate = (Map) candidates.get(0);
        Map content = (Map) candidate.get("content");
        List parts = (List) content.get("parts");
        Map part = (Map) parts.get(0);

        Map inlineData = (Map) part.get("inlineData");
        if (inlineData == null || !inlineData.containsKey("data")) {
            throw new RuntimeException("No audio inlineData returned by Gemini TTS");
        }

        String base64Audio = (String) inlineData.get("data");
        byte[] pcmData = Base64.getDecoder().decode(base64Audio);

        return pcmToWav(pcmData, 24000);
    }

    public static byte[] pcmToWav(byte[] pcmData, int sampleRate) {
        int totalDataLen = pcmData.length + 36;
        int channels = 1;
        long byteRate = (long) sampleRate * channels * 2;
        byte[] header = new byte[44];

        header[0] = 'R'; header[1] = 'I'; header[2] = 'F'; header[3] = 'F';
        header[4] = (byte) (totalDataLen & 0xff);
        header[5] = (byte) ((totalDataLen >> 8) & 0xff);
        header[6] = (byte) ((totalDataLen >> 16) & 0xff);
        header[7] = (byte) ((totalDataLen >> 24) & 0xff);
        header[8] = 'W'; header[9] = 'A'; header[10] = 'V'; header[11] = 'E';
        header[12] = 'f'; header[13] = 'm'; header[14] = 't'; header[15] = ' ';
        header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0;
        header[20] = 1; header[21] = 0; // AudioFormat (1 = PCM)
        header[22] = (byte) channels; header[23] = 0;
        header[24] = (byte) (sampleRate & 0xff);
        header[25] = (byte) ((sampleRate >> 8) & 0xff);
        header[26] = (byte) ((sampleRate >> 16) & 0xff);
        header[27] = (byte) ((sampleRate >> 24) & 0xff);
        header[28] = (byte) (byteRate & 0xff);
        header[29] = (byte) ((byteRate >> 8) & 0xff);
        header[30] = (byte) ((byteRate >> 16) & 0xff);
        header[31] = (byte) ((byteRate >> 24) & 0xff);
        header[32] = (byte) (channels * 2); header[33] = 0; // BlockAlign
        header[34] = 16; header[35] = 0; // BitsPerSample
        header[36] = 'd'; header[37] = 'a'; header[38] = 't'; header[39] = 'a';
        header[40] = (byte) (pcmData.length & 0xff);
        header[41] = (byte) ((pcmData.length >> 8) & 0xff);
        header[42] = (byte) ((pcmData.length >> 16) & 0xff);
        header[43] = (byte) ((pcmData.length >> 24) & 0xff);

        byte[] wav = new byte[header.length + pcmData.length];
        System.arraycopy(header, 0, wav, 0, header.length);
        System.arraycopy(pcmData, 0, wav, header.length, pcmData.length);
        return wav;
    }
}
