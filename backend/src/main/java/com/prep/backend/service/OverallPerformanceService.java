package com.prep.backend.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.prep.backend.entity.Difficulty;
import com.prep.backend.entity.Interview;
import com.prep.backend.entity.InterviewAnswer;
import com.prep.backend.entity.InterviewStatus;
import com.prep.backend.entity.InterviewType;
import com.prep.backend.entity.User;
import com.prep.backend.repository.InterviewAnswerRepository;
import com.prep.backend.repository.InterviewRepository;

@Service
public class OverallPerformanceService {

    private final InterviewRepository interviewRepository;
    private final InterviewAnswerRepository interviewAnswerRepository;

    public OverallPerformanceService(
            InterviewRepository interviewRepository,
            InterviewAnswerRepository interviewAnswerRepository
    ) {
        this.interviewRepository = interviewRepository;
        this.interviewAnswerRepository = interviewAnswerRepository;
    }


    public Map<String, Object> getOverallPerformance(User user) {

        List<Interview> allInterviews =
                interviewRepository.findByUserOrderByStartedAtDesc(user);

        List<Interview> completedInterviews = allInterviews.stream()
                .filter(interview ->
                        interview.getStatus() == InterviewStatus.COMPLETED)
                .toList();


        int totalInterviews = completedInterviews.size();

        if (totalInterviews == 0) {
            return buildEmptyPerformanceResponse();
        }


        double totalOverallScore = 0;

        double totalCommunicationScore = 0;
        double totalTechnicalScore = 0;
        double totalProjectScore = 0;
        double totalResponseQualityScore = 0;

        int communicationCount = 0;
        int technicalCount = 0;
        int projectCount = 0;
        int responseQualityCount = 0;

        double bestScore = 0;

        long totalPracticeSeconds = 0;

        List<Map<String, Object>> recentInterviews = new ArrayList<>();

        Map<String, List<Double>> typeScores = new HashMap<>();
        Map<String, List<Double>> difficultyScores = new HashMap<>();


        for (Interview interview : completedInterviews) {

            List<InterviewAnswer> answers =
                    interviewAnswerRepository
                            .findByInterviewOrderByIdAsc(interview);

            double communicationTotal = 0;
            double technicalTotal = 0;
            double projectTotal = 0;
            double responseQualityTotal = 0;

            int communicationAnswers = 0;
            int technicalAnswers = 0;
            int projectAnswers = 0;
            int responseQualityAnswers = 0;


            for (InterviewAnswer answer : answers) {

                if (answer.getCommunicationScore() != null) {
                    communicationTotal += answer.getCommunicationScore();
                    communicationAnswers++;
                }

                if (answer.getTechnicalKnowledgeScore() != null) {
                    technicalTotal += answer.getTechnicalKnowledgeScore();
                    technicalAnswers++;
                }

                if (answer.getProjectKnowledgeScore() != null) {
                    projectTotal += answer.getProjectKnowledgeScore();
                    projectAnswers++;
                }

                if (answer.getResponseQualityScore() != null) {
                    responseQualityTotal += answer.getResponseQualityScore();
                    responseQualityAnswers++;
                }
            }


            double communicationAverage =
                    average(communicationTotal, communicationAnswers);

            double technicalAverage =
                    average(technicalTotal, technicalAnswers);

            double projectAverage =
                    average(projectTotal, projectAnswers);

            double responseQualityAverage =
                    average(responseQualityTotal, responseQualityAnswers);


            List<Double> availableScores = new ArrayList<>();

            if (communicationAnswers > 0) {
                availableScores.add(communicationAverage);
                totalCommunicationScore += communicationAverage;
                communicationCount++;
            }

            if (technicalAnswers > 0) {
                availableScores.add(technicalAverage);
                totalTechnicalScore += technicalAverage;
                technicalCount++;
            }

            if (projectAnswers > 0) {
                availableScores.add(projectAverage);
                totalProjectScore += projectAverage;
                projectCount++;
            }

            if (responseQualityAnswers > 0) {
                availableScores.add(responseQualityAverage);
                totalResponseQualityScore += responseQualityAverage;
                responseQualityCount++;
            }


            double interviewScore =
                    availableScores.stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0);


            totalOverallScore += interviewScore;

            if (interviewScore > bestScore) {
                bestScore = interviewScore;
            }


            if (interview.getStartedAt() != null
                    && interview.getCompletedAt() != null) {

                try {
                    long seconds = Duration.between(
                            interview.getStartedAt(),
                            interview.getCompletedAt()
                    ).getSeconds();

                    if (seconds > 0) {
                        totalPracticeSeconds += seconds;
                    }

                } catch (Exception ignored) {
                    // Ignore invalid duration
                }
            }


            String interviewType =
                    interview.getInterviewType() != null
                            ? interview.getInterviewType().name()
                            : "UNKNOWN";

            typeScores
                    .computeIfAbsent(interviewType, key -> new ArrayList<>())
                    .add(interviewScore);


            String difficulty =
                    interview.getDifficulty() != null
                            ? interview.getDifficulty().name()
                            : "UNKNOWN";

            difficultyScores
                    .computeIfAbsent(difficulty, key -> new ArrayList<>())
                    .add(interviewScore);


            Map<String, Object> interviewData = new HashMap<>();

            interviewData.put("interviewId", interview.getId());
            interviewData.put("interviewType", interviewType);
            interviewData.put("targetRole", interview.getTargetRole());
            interviewData.put("difficulty", difficulty);
            interviewData.put("score", round(interviewScore));
            interviewData.put("startedAt", interview.getStartedAt());
            interviewData.put("completedAt", interview.getCompletedAt());

            recentInterviews.add(interviewData);
        }


        double averageScore =
                totalOverallScore / totalInterviews;


        Map<String, Object> response = new HashMap<>();

        response.put("totalInterviews", totalInterviews);

        response.put("averageScore", round(averageScore));

        response.put("bestScore", round(bestScore));

        response.put(
                "totalPracticeSeconds",
                totalPracticeSeconds
        );

        response.put(
                "totalPracticeMinutes",
                totalPracticeSeconds / 60
        );


        response.put(
                "technicalAverage",
                round(average(totalTechnicalScore, technicalCount))
        );

        response.put(
                "communicationAverage",
                round(average(totalCommunicationScore, communicationCount))
        );

        response.put(
                "projectAverage",
                round(average(totalProjectScore, projectCount))
        );

        response.put(
                "responseQualityAverage",
                round(average(
                        totalResponseQualityScore,
                        responseQualityCount
                ))
        );


        response.put(
                "performanceByInterviewType",
                buildGroupedPerformance(typeScores)
        );

        response.put(
                "performanceByDifficulty",
                buildGroupedPerformance(difficultyScores)
        );


        response.put(
                "recentInterviews",
                recentInterviews.stream()
                        .limit(10)
                        .toList()
        );


        response.put(
                "readinessLevel",
                getReadinessLevel(averageScore)
        );


        response.put(
                "strengths",
                buildStrengths(
                        average(
                                totalCommunicationScore,
                                communicationCount
                        ),
                        average(
                                totalTechnicalScore,
                                technicalCount
                        ),
                        average(
                                totalProjectScore,
                                projectCount
                        ),
                        average(
                                totalResponseQualityScore,
                                responseQualityCount
                        )
                )
        );


        response.put(
                "areasToImprove",
                buildAreasToImprove(
                        average(
                                totalCommunicationScore,
                                communicationCount
                        ),
                        average(
                                totalTechnicalScore,
                                technicalCount
                        ),
                        average(
                                totalProjectScore,
                                projectCount
                        ),
                        average(
                                totalResponseQualityScore,
                                responseQualityCount
                        )
                )
        );


        return response;
    }


    private double average(double total, int count) {

        if (count == 0) {
            return 0;
        }

        return total / count;
    }


    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }


    private Map<String, Double> buildGroupedPerformance(
            Map<String, List<Double>> groupedScores
    ) {

        Map<String, Double> result = new HashMap<>();

        groupedScores.forEach((key, values) -> {

            double average =
                    values.stream()
                            .mapToDouble(Double::doubleValue)
                            .average()
                            .orElse(0);

            result.put(key, round(average));
        });

        return result;
    }


    private String getReadinessLevel(double score) {

        if (score >= 85) {
            return "Interview Ready";
        }

        if (score >= 70) {
            return "Nearly Ready";
        }

        if (score >= 50) {
            return "Keep Practising";
        }

        return "Needs Improvement";
    }


    private List<String> buildStrengths(
            double communication,
            double technical,
            double project,
            double responseQuality
    ) {

        List<String> strengths = new ArrayList<>();

        if (communication >= 70) {
            strengths.add("Strong communication");
        }

        if (technical >= 70) {
            strengths.add("Good technical knowledge");
        }

        if (project >= 70) {
            strengths.add("Good project understanding");
        }

        if (responseQuality >= 70) {
            strengths.add("Strong response quality");
        }

        return strengths;
    }


    private List<String> buildAreasToImprove(
            double communication,
            double technical,
            double project,
            double responseQuality
    ) {

        List<String> areas = new ArrayList<>();

        if (communication > 0 && communication < 70) {
            areas.add("Improve communication clarity and structure");
        }

        if (technical > 0 && technical < 70) {
            areas.add("Strengthen technical knowledge");
        }

        if (project > 0 && project < 70) {
            areas.add("Improve project understanding and explanation");
        }

        if (responseQuality > 0 && responseQuality < 70) {
            areas.add("Improve answer relevance, completeness, and reasoning");
        }

        return areas;
    }


    private Map<String, Object> buildEmptyPerformanceResponse() {

        Map<String, Object> response = new HashMap<>();

        response.put("totalInterviews", 0);
        response.put("averageScore", 0);
        response.put("bestScore", 0);
        response.put("totalPracticeSeconds", 0);
        response.put("totalPracticeMinutes", 0);

        response.put("technicalAverage", 0);
        response.put("communicationAverage", 0);
        response.put("projectAverage", 0);
        response.put("responseQualityAverage", 0);

        response.put(
                "performanceByInterviewType",
                new HashMap<>()
        );

        response.put(
                "performanceByDifficulty",
                new HashMap<>()
        );

        response.put(
                "recentInterviews",
                new ArrayList<>()
        );

        response.put(
                "readinessLevel",
                "No Interviews Yet"
        );

        response.put(
                "strengths",
                new ArrayList<>()
        );

        response.put(
                "areasToImprove",
                new ArrayList<>()
        );

        return response;
    }
}