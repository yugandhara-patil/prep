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

        List<Map<String, Object>> unfinishedInterviews = new ArrayList<>();
        for (Interview interview : allInterviews) {
            if (interview.getStatus() != InterviewStatus.COMPLETED) {
                Map<String, Object> unfinishedData = new HashMap<>();
                unfinishedData.put("interviewId", interview.getId());
                unfinishedData.put("interviewType", interview.getInterviewType() != null ? interview.getInterviewType().name() : "TECHNICAL");
                unfinishedData.put("targetRole", interview.getTargetRole());
                unfinishedData.put("difficulty", interview.getDifficulty() != null ? interview.getDifficulty().name() : "MEDIUM");
                unfinishedData.put("technicalFocus", interview.getTechnicalFocus());
                unfinishedData.put("status", interview.getStatus().name());
                unfinishedData.put("startedAt", interview.getStartedAt());
                int answeredCount = interviewAnswerRepository.findByInterviewOrderByIdAsc(interview).size();
                unfinishedData.put("questionsAnswered", answeredCount);
                unfinishedInterviews.add(unfinishedData);
            }
        }

        int totalInterviews = completedInterviews.size();

        if (totalInterviews == 0) {
            return buildEmptyPerformanceResponse(unfinishedInterviews);
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

        int totalAnswersEvaluated = 0;
        int totalIncorrectAnswers = 0;
        int totalPartialAnswers = 0;
        int techAnswersEvaluated = 0;
        int techGapsCount = 0;
        int hrAnswersEvaluated = 0;
        int hrGapsCount = 0;

        List<Map<String, Object>> recentInterviews = new ArrayList<>();

        Map<String, List<Double>> typeScores = new HashMap<>();
        Map<String, List<Double>> difficultyScores = new HashMap<>();


        for (Interview interview : completedInterviews) {

            boolean isHr = interview.getInterviewType() == InterviewType.HR;

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

                totalAnswersEvaluated++;
                String eval = answer.getEvaluation() != null ? answer.getEvaluation().toUpperCase() : "";
                boolean isGap = "INCORRECT".equals(eval) || "PARTIALLY_CORRECT".equals(eval);
                if ("INCORRECT".equals(eval)) totalIncorrectAnswers++;
                if ("PARTIALLY_CORRECT".equals(eval)) totalPartialAnswers++;

                if (isHr) {
                    hrAnswersEvaluated++;
                    if (isGap) hrGapsCount++;
                } else {
                    techAnswersEvaluated++;
                    if (isGap) techGapsCount++;
                }

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


            long durationSeconds = 0;
            if (interview.getStartedAt() != null && interview.getCompletedAt() != null) {
                try {
                    durationSeconds = Duration.between(interview.getStartedAt(), interview.getCompletedAt()).getSeconds();
                } catch (Exception ignored) {
                }
            }

            Map<String, Object> interviewData = new HashMap<>();

            interviewData.put("interviewId", interview.getId());
            interviewData.put("interviewType", interviewType);
            interviewData.put("targetRole", interview.getTargetRole());
            interviewData.put("difficulty", difficulty);
            interviewData.put("score", round(interviewScore));
            interviewData.put("startedAt", interview.getStartedAt());
            interviewData.put("completedAt", interview.getCompletedAt());
            interviewData.put("durationSeconds", Math.max(0, durationSeconds));

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
                "unfinishedInterviews",
                unfinishedInterviews
        );


        response.put(
                "readinessLevel",
                getReadinessLevel(averageScore)
        );


        response.put(
                "strengths",
                buildStrengths(
                        average(totalCommunicationScore, communicationCount),
                        communicationCount,
                        average(totalTechnicalScore, technicalCount),
                        technicalCount,
                        average(totalProjectScore, projectCount),
                        projectCount,
                        average(totalResponseQualityScore, responseQualityCount),
                        responseQualityCount,
                        totalInterviews
                )
        );

        response.put(
                "areasToImprove",
                buildAreasToImprove(
                        average(totalCommunicationScore, communicationCount),
                        average(totalTechnicalScore, technicalCount),
                        average(totalProjectScore, projectCount),
                        average(totalResponseQualityScore, responseQualityCount),
                        averageScore,
                        totalInterviews,
                        totalAnswersEvaluated,
                        techAnswersEvaluated,
                        techGapsCount,
                        hrAnswersEvaluated,
                        hrGapsCount
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
            int commCount,
            double technical,
            int techCount,
            double project,
            int projCount,
            double responseQuality,
            int qualCount,
            int totalInterviews
    ) {
        List<String> strengths = new ArrayList<>();

        if (communication >= 70 && commCount > 0) {
            strengths.add("Strong Communication: Demonstrated clear delivery and professional articulation across "
                    + commCount + " evaluated response(s).");
        }

        if (technical >= 70 && techCount > 0) {
            strengths.add("Technical Competence: Solid foundational understanding and concept accuracy across "
                    + techCount + " technical question(s).");
        }

        if (project >= 70 && projCount > 0) {
            strengths.add("Project Knowledge: Clear explanation of project architecture, technologies used, and real-world decisions.");
        }

        if (responseQuality >= 70 && qualCount > 0) {
            strengths.add("High Response Quality: Answers directly address questions with strong relevance and structure.");
        }

        if (strengths.isEmpty() && totalInterviews > 0) {
            strengths.add("Active Interview Practice: Demonstrating commitment by completing full mock sessions to build real-world interview fluency.");
        }

        return strengths;
    }

    private List<String> buildAreasToImprove(
            double communication,
            double technical,
            double project,
            double responseQuality,
            double overallAverage,
            int totalInterviews,
            int totalAnswers,
            int techAnswers,
            int techGaps,
            int hrAnswers,
            int hrGaps
    ) {
        List<String> areas = new ArrayList<>();

        if (totalInterviews == 0) {
            return areas;
        }

        // 1. Technical Performance
        if (techAnswers > 0) {
            if (techGaps > 0) {
                areas.add("Technical Depth & Edge Cases: " + techGaps + " of " + techAnswers
                        + " technical answer(s) had inaccuracies or missing coverage (recorded average: "
                        + Math.round(technical) + "%). Review core framework fundamentals, data structures, and concrete implementation details.");
            } else if (technical > 0 && technical < 80) {
                areas.add("Technical Explanation Breadth: Technical average is " + Math.round(technical)
                        + "%. Deepen responses by explaining underlying system mechanics, concurrency, and performance trade-offs.");
            }
        }

        // 2. HR & Behavioral Performance
        if (hrAnswers > 0) {
            if (hrGaps > 0) {
                areas.add("Behavioral Structure (STAR Method): " + hrGaps + " of " + hrAnswers
                        + " HR response(s) needed clearer structure. Frame behavioral examples using Situation, Task, Action, and measurable Result.");
            } else if (communication > 0 && communication < 80) {
                areas.add("Concise Communication Delivery: Recorded communication average is " + Math.round(communication)
                        + "%. Lead with concise direct conclusions before providing supporting background details.");
            }
        }

        // 3. Project Depth
        if (project > 0 && project < 80) {
            areas.add("Project Contribution & Architecture: Project knowledge average is " + Math.round(project)
                    + "%. Be prepared to articulate architecture decisions, technology selections, trade-offs, and measurable outcomes in depth.");
        }

        // 4. Response Quality
        if (responseQuality > 0 && responseQuality < 80) {
            areas.add("Answer Directness & Relevance: Response quality average is " + Math.round(responseQuality)
                    + "%. Address the interviewer's exact prompt directly in your opening sentence before elaborating on tangential details.");
        }

        // 5. If all dimensions scored very high (e.g. >= 80%), provide advanced growth recommendations so the section is never empty
        if (areas.isEmpty()) {
            areas.add("Advanced Scenarios & Trade-offs: Strong performance across all evaluated sessions (overall average: "
                    + Math.round(overallAverage) + "% across " + totalInterviews + " completed session(s)). Challenge yourself with Hard difficulty interviews and complex system scale scenarios.");
            areas.add("Elevator Pitch & Executive Summary: Practice summarizing complex multi-step technical architectures into concise 60-second executive summaries.");
        }

        return areas;
    }


    private Map<String, Object> buildEmptyPerformanceResponse(List<Map<String, Object>> unfinishedInterviews) {

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
                "unfinishedInterviews",
                unfinishedInterviews != null ? unfinishedInterviews : new ArrayList<>()
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