import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertTriangle,
  Home,
  RotateCcw,
  LogOut,
  StopCircle,
  Loader2,
} from "lucide-react";

import GLBAvatarTest from "./GLBAvatarTest";

function Interview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);

  const isHRInterview =
    String(setup?.interviewType || "").toUpperCase() === "HR";

  const [seconds, setSeconds] = useState(0);

  const [isInterviewStarted, setIsInterviewStarted] =
    useState(false);

  const [showQuitModal, setShowQuitModal] = useState(false);
  const [isExited, setIsExited] = useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState("");

  // Keep Maya's complete spoken response separate from the
  // actual question sent back to the backend.
  const [mayaResponseText, setMayaResponseText] =
    useState("");

  // Tracks where we are in the interview conversation.
  // The backend uses this to prevent repeated questions.
  const [conversationStage, setConversationStage] =
    useState("GREETING");

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  // =========================
  // SPEECH RECOGNITION STATE
  // =========================

  const [isListening, setIsListening] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [isProcessingAnswer, setIsProcessingAnswer] =
    useState(false);

  const [micGuidance, setMicGuidance] = useState("");

  const [speechBoundary, setSpeechBoundary] =
    useState(0);

  // Stores interview performance for the final results page.
  const [performance, setPerformance] = useState({
    evaluations: [],
    questionsAnswered: 0,
  });

  // =========================
  // REFS
  // =========================

  const recognitionRef = useRef(null);

  const shouldListenRef = useRef(false);

  const transcriptRef = useRef("");

  const isListeningRef = useRef(false);

  const isSubmittingRef = useRef(false);

  const isProcessingAnswerRef = useRef(false);

  const isInterviewStartedRef =
    useRef(false);

  const currentQuestionRef =
    useRef("");

  const pendingNextQuestionRef =
    useRef(null);

  // Ends the interview after Maya finishes the closing.
  const pendingFinishRef =
    useRef(null);

  // Frontend guard against accidental repeated questions.
  const askedQuestionsRef =
    useRef([]);

  const conversationStageRef =
    useRef("GREETING");

  const activeAudioRef = useRef(null);
  const activeSpeechIdRef = useRef(0);

  function stopSpeakingAudio() {
    window.speechSynthesis.cancel();
    if (activeAudioRef.current) {
      try {
        activeAudioRef.current.pause();
        activeAudioRef.current.currentTime = 0;
      } catch (e) {
        // ignore
      }
      activeAudioRef.current = null;
    }
  }

  function speakWithBrowserSynthesis(speechText, onComplete) {
    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice =
        voices.find((v) => v.name.toLowerCase().includes("samantha")) ||
        voices.find((v) => v.name.toLowerCase().includes("ava")) ||
        voices.find((v) => v.name.toLowerCase().includes("google us english")) ||
        voices.find((v) => v.lang === "en-US" && v.localService) ||
        voices.find((v) => v.lang.startsWith("en"));

      if (naturalVoice) utterance.voice = naturalVoice;

      utterance.onstart = () => {
        console.log("Maya started speaking");
        setIsSpeaking(true);
        shouldListenRef.current = false;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        isListeningRef.current = false;
        setIsListening(false);
      };

      utterance.onboundary = (e) => {
        if (e.name === "word") {
          setSpeechBoundary((prev) => prev + 1);
        }
      };

      utterance.onend = () => {
        if (onComplete) onComplete();
      };

      utterance.onerror = (e) => {
        console.error("Browser speech error:", e);
        if (onComplete) onComplete();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      if (onComplete) onComplete();
    }
  }

  // Preload speech synthesis voices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      const handleVoices = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", handleVoices);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", handleVoices);
      };
    }
  }, []);

  // =========================
  // LOAD INTERVIEW SETUP
  // =========================

  useEffect(() => {
    const storedSetup =
      sessionStorage.getItem("interviewSetup");

    if (!storedSetup) {
      navigate("/start-interview");
      return;
    }

    const parsedSetup =
      JSON.parse(storedSetup);

    setSetup(parsedSetup);

    const initialQuestion =
      parsedSetup.firstQuestion ||
      "Unable to load the interview question.";

    const initialStage =
      parsedSetup.conversationStage || "GREETING";

    setCurrentQuestion(initialQuestion);
    setMayaResponseText(initialQuestion);
    currentQuestionRef.current = initialQuestion;

    askedQuestionsRef.current = [initialQuestion];
    pendingNextQuestionRef.current = null;
    pendingFinishRef.current = null;

    setConversationStage(initialStage);
    conversationStageRef.current = initialStage;
  }, [navigate]);

  // =========================
  // KEEP INTERVIEW REF UPDATED
  // =========================

  useEffect(() => {
    isInterviewStartedRef.current =
      isInterviewStarted;
  }, [isInterviewStarted]);

  // =========================
  // TIMER
  // =========================

  useEffect(() => {
    if (!isInterviewStarted) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInterviewStarted]);

  // =========================
  // CLEAN UP SPEECH
  // =========================

  useEffect(() => {
    return () => {
      stopSpeakingAudio();

      shouldListenRef.current = false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // =========================
  // FORMAT TIMER
  // =========================

  function formatTime(totalSeconds) {
    const minutes =
      Math.floor(totalSeconds / 60);

    const remainingSeconds =
      totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  // =========================================================
  // CLEAN SPEECH TRANSCRIPT
  // =========================================================

  function cleanTranscript(text) {
    if (!text) return "";
    let cleaned = String(text)
      .replace(/\b(no|yes|okay|ok)\s+\1\b/gi, "$1")
      .replace(/\s+/g, " ")
      .trim();

    const termMap = [
      [/\bspring\s*boot\b/gi, "Spring Boot"],
      [/\bpostgre\s*sql\b|\bpostgres\s*sql\b/gi, "PostgreSQL"],
      [/\bmy\s*sequel\b|\bmy\s*sql\b/gi, "MySQL"],
      [/\bsequel\b/gi, "SQL"],
      [/\breact\s*js\b/gi, "React"],
      [/\bnode\s*js\b/gi, "Node.js"],
      [/\bjava\s*script\b/gi, "JavaScript"],
      [/\btype\s*script\b/gi, "TypeScript"],
      [/\brest\s*api\b|\brestful\s*api\b/gi, "REST API"],
      [/\brest\s*apis\b|\brestful\s*apis\b/gi, "REST APIs"],
      [/\bj\s*son\b|\bjay\s*son\b/gi, "JSON"],
      [/\bj\s*w\s*t\b/gi, "JWT"],
      [/\bdot\s*net\b/gi, ".NET"],
      [/\bci\s*\/\s*cd\b|\bci\s*cd\b/gi, "CI/CD"],
    ];

    for (const [pattern, replacement] of termMap) {
      cleaned = cleaned.replace(pattern, replacement);
    }
    return cleaned;
  }

  // =========================================================
  // CLEAN MAYA SPEECH
  // =========================================================

  function cleanSpeechText(text) {
    return String(text || "")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_#~]/g, "")
      .replace(/[()[\]{}]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  // =========================================================
  // START SPEECH RECOGNITION
  // =========================================================

  function startListening() {
    if (!isInterviewStartedRef.current) {
      return;
    }

    if (conversationStageRef.current === "CLOSING") {
      console.log("Interview is closing. Microphone will remain off.");
      return;
    }

    if (isSpeaking) {
      console.log(
        "Maya is still speaking. Microphone will remain off."
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error(
        "Speech Recognition is not supported in this browser."
      );

      setTranscript(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    // Avoid starting twice
    if (isListeningRef.current) {
      return;
    }

    // Clear previous answer
    transcriptRef.current = "";
    setTranscript("");

    shouldListenRef.current = true;

    const recognition =
      new SpeechRecognition();

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-US";

    recognitionRef.current = recognition;

    // =========================
    // RECOGNITION START
    // =========================

    recognition.onstart = () => {
      console.log(
        "🎙 Speech recognition started"
      );

      isListeningRef.current = true;

      setIsListening(true);
    };

    // =========================
    // RECOGNITION RESULTS
    // =========================
    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      const combined = cleanTranscript(finalTranscript + interimTranscript);
      if (combined.trim()) {
        transcriptRef.current = combined;
        setTranscript(combined);
        setMicGuidance("");
      }
    };

    // =========================
    // RECOGNITION ERROR
    // =========================
    recognition.onerror = (event) => {
      console.warn("🎙 Speech recognition status:", event.error);

      if (event.error === "not-allowed") {
        setMicGuidance("Microphone permission was denied. Please allow microphone access or type your answer below.");
        setShowManualInput(true);
      } else if (event.error === "audio-capture") {
        setMicGuidance("No microphone detected. Please check your audio settings or type your answer below.");
        setShowManualInput(true);
      } else if (event.error === "no-speech") {
        // Normal silence event from speech recognition engine - keep listening without auto-submitting
      }
    };

    // =========================
    // RECOGNITION END
    // =========================
    recognition.onend = () => {
      console.log("🎙 Speech recognition paused or ended");

      isListeningRef.current = false;
      setIsListening(false);

      // Keep speech recognition continuously active while candidate is answering
      if (
        shouldListenRef.current &&
        isInterviewStartedRef.current &&
        !isProcessingAnswerRef.current
      ) {
        setTimeout(() => {
          if (
            shouldListenRef.current &&
            isInterviewStartedRef.current &&
            !isListeningRef.current &&
            !isProcessingAnswerRef.current
          ) {
            startListening();
          }
        }, 100);
      }
    };

    // =========================
    // START
    // =========================

    try {
      recognition.start();

      console.log(
        "🎙 Starting microphone..."
      );
    } catch (error) {
      console.error(
        "Failed to start speech recognition:",
        error
      );
    }
  }

  function isIDontKnowAnswer(text) {
    const normalized = String(text || "")
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return [
      "i dont know",
      "i don't know",
      "dont know",
      "don't know",
      "i have no idea",
      "no idea",
      "not sure",
      "i am not sure",
      "i'm not sure",
      "i do not know",
    ].includes(normalized);
  }

  // =========================================================
  // SUBMIT ANSWER TO BACKEND
  // =========================================================

  async function submitAnswerToBackend(answerArg) {
    const answer = (answerArg || transcriptRef.current || transcript || "").trim();

    const questionBeingAnswered =
      currentQuestionRef.current || currentQuestion;

    const stageBeingAnswered =
      conversationStageRef.current || "GREETING";

    console.log("🔥 SUBMIT ANSWER FUNCTION CALLED");
    console.log("Interview ID:", setup?.interviewId);
    console.log("Current Question:", questionBeingAnswered);
    console.log("Conversation Stage:", stageBeingAnswered);
    console.log("Transcript:", answer);

    if (!answer) {
      console.log("No answer to submit.");
      setMicGuidance("Please speak your answer before clicking Finish Answer.");
      return;
    }

    if (!setup?.interviewId) {
      console.error("Interview ID is missing.");
      return;
    }

    if (!questionBeingAnswered) {
      console.error("Current question is missing.");
      return;
    }

    if (isProcessingAnswerRef.current) {
      console.log("Answer is already being processed.");
      return;
    }

    isProcessingAnswerRef.current = true;
    setIsProcessingAnswer(true);
    setMicGuidance("");

    // Ensure microphone is stopped while answer is being evaluated
    stopListening();

    const token = localStorage.getItem("token");

    try {
      // One request per answer. We deliberately do not preload the
      // next question because the interviewer must hear the answer
      // before deciding what to ask next.
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/answer`,
        {
          interviewId: setup.interviewId,
          userAnswer: answer,
          currentQuestion: questionBeingAnswered,
          stage: stageBeingAnswered,
        },
        {
          timeout: 120000,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("================================");
      console.log("✅ INTERVIEW RESPONSE");
      console.log(response.data);
      console.log("================================");

      // Handle conversational remarks, clarification requests, and non-answers without advancing
      if (response.data?.conversationalRemark || response.data?.evaluation === "UNRELATED") {
        const acknowledgement = response.data?.feedback || response.data?.nextQuestion || "Let's stay focused on your interview. Would you like to try answering again?";
        console.log("🗣️ Maya conversational remark acknowledgement:", acknowledgement);

        // Reset transcript
        transcriptRef.current = "";
        setTranscript("");

        // Maya speaks the polite context-aware redirection and stays on the same question
        setMayaResponseText(acknowledgement);
        speakQuestion(acknowledgement);
        return;
      }

      const evaluation = response.data?.evaluation;
      const feedback = response.data?.feedback || "";
      const nextQuestion = response.data?.nextQuestion;
      const nextStage =
        response.data?.nextStage || stageBeingAnswered;

      // Keep a lightweight performance record for the final report.
      setPerformance((previous) => ({
        evaluations: [
          ...previous.evaluations,
          {
            evaluation,
            feedback,
            question: questionBeingAnswered,
            answer,
            stage: stageBeingAnswered,
            communicationScore: response.data?.communicationScore ?? null,
            technicalKnowledgeScore: response.data?.technicalKnowledgeScore ?? null,
            projectKnowledgeScore: response.data?.projectKnowledgeScore ?? null,
            responseQualityScore: response.data?.responseQualityScore ?? null,
          },
        ],
        questionsAnswered: previous.questionsAnswered + 1,
      }));

      // The candidate's final "Thank you" ends the interview.
      if (stageBeingAnswered === "CLOSING") {
        finishInterview(evaluation, questionBeingAnswered, answer);
        return;
      }

      if (!nextQuestion) {
        console.error("Backend did not return a next question.");
        return;
      }

      // Move the interview stage only after the answer has been
      // processed by the backend.
      const normalizedNextQuestion =
        String(nextQuestion)
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();

      const duplicateQuestion =
        askedQuestionsRef.current.some(
          (question) =>
            String(question)
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, " ")
              .trim() === normalizedNextQuestion
        );

      if (duplicateQuestion) {
        console.warn(
          "Backend returned a repeated question. Backend retry protection should prevent this."
        );
      }

      askedQuestionsRef.current.push(nextQuestion);

      // =========================================================
      // STAGE / QUESTION UPDATE
      // =========================================================
      const evaluationType = String(evaluation || "").toUpperCase();

      // Advance interview stage seamlessly to preserve sequence and avoid unwanted retries
      conversationStageRef.current = nextStage;
      setConversationStage(nextStage);

      currentQuestionRef.current = nextQuestion;
      setCurrentQuestion(nextQuestion);

      transcriptRef.current = "";
      setTranscript("");

      // =========================================================
      // MAYA SPOKEN RESPONSE
      // =========================================================
      const isCandidateQuestionsClosing =
        stageBeingAnswered === "CANDIDATE_QUESTIONS" &&
        nextStage === "CLOSING";

      const isCorrection =
        evaluationType === "INCORRECT" ||
        evaluationType === "PARTIALLY_CORRECT";

      console.log("Evaluation:", evaluation);
      console.log("Next stage:", nextStage);
      console.log("Candidate questions closing:", isCandidateQuestionsClosing);

      if (isCandidateQuestionsClosing) {
        pendingFinishRef.current = {
          evaluation,
          question: nextQuestion,
          answer,
        };

        console.log("🗣 Maya closing:", nextQuestion);
        setMayaResponseText(nextQuestion);
        await speakQuestion(nextQuestion);
      } else if (isCorrection && feedback && feedback.trim()) {
        let spokenFeedback = feedback.trim();

        if (
          evaluationType === "PARTIALLY_CORRECT" &&
          !spokenFeedback.toLowerCase().startsWith("your answer is partially correct")
        ) {
          spokenFeedback =
            "Your answer is partially correct. " + spokenFeedback;
        } else if (evaluationType === "INCORRECT") {
          const isIDontKnow = isIDontKnowAnswer(answer);
          if (isIDontKnow) {
            spokenFeedback = spokenFeedback
              .replace(/^(no, )?your answer is incorrect\.\s*/i, "")
              .trim();
            spokenFeedback =
              "It is okay. " + (spokenFeedback || "");
          } else if (
            !spokenFeedback.toLowerCase().startsWith("your answer is incorrect") &&
            !spokenFeedback.toLowerCase().startsWith("no, your answer is incorrect")
          ) {
            spokenFeedback =
              "Your answer is incorrect. " + spokenFeedback;
          }
        }

        const fullSpoken = `${spokenFeedback.trim()} ${nextQuestion}`.trim();
        console.log("🗣 Maya correction + next question:", fullSpoken);
        setMayaResponseText(fullSpoken);
        await speakQuestion(fullSpoken);
      } else {
        const isTechnicalStage = stageBeingAnswered.startsWith("TECHNICAL_");
        const spokenResponse =
          isTechnicalStage && evaluationType === "CORRECT"
            ? `Yes, that’s correct. ${nextQuestion}`
            : nextQuestion;

        setMayaResponseText(spokenResponse);
        await speakQuestion(spokenResponse);
      }

    } catch (error) {
      console.error("❌ Failed to submit answer:", error);

      if (error.response) {
        console.error("Backend status:", error.response.status);
        console.error("Backend response:", error.response.data);
      }

      // Gracefully prompt candidate to retry without losing interview progress
      const retryPrompt = "I had a brief connection issue. Could you please repeat your response?";
      setMayaResponseText(retryPrompt);
      await speakQuestion(retryPrompt);
    } finally {
      setIsProcessingAnswer(false);
      isProcessingAnswerRef.current = false;
    }
  }

  // =========================================================
  // FINISH INTERVIEW
  // =========================================================

  function finishInterview(finalEvaluation, finalQuestion, finalAnswer) {
    isInterviewStartedRef.current = false;
    shouldListenRef.current = false;

    stopSpeakingAudio();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }

    setIsSpeaking(false);
    setIsListening(false);
    setIsInterviewStarted(false);

    const currentPerformance = performance;

    const resultData = {
      // The interview ID is required by the results page to load the
      // authoritative performance data saved by the backend.
      interviewId: setup?.interviewId || null,
      interviewType: setup?.interviewType || "TECHNICAL",
      targetRole: setup?.targetRole || "",
      difficulty: setup?.difficulty || "",
      technicalFocus: setup?.technicalFocus || "",
      timeSeconds: seconds,
      questionsAnswered: currentPerformance.questionsAnswered,
      evaluations: currentPerformance.evaluations,
      completed: true,
    };

    sessionStorage.setItem(
      "interviewResults",
      JSON.stringify(resultData)
    );

    if (setup?.interviewId) {
      sessionStorage.setItem(
        "interviewResultsInterviewId",
        String(setup.interviewId)
      );
    }

    navigate("/interview-results", {
      state: { interviewId: setup?.interviewId || null },
    });
  }

  // =========================================================
  // STOP SPEECH RECOGNITION
  // =========================================================

  function stopListening() {
    shouldListenRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // Recognition already stopped
      }
    }

    isListeningRef.current = false;
    setIsListening(false);
    console.log("🎙 Microphone stopped");
  }

  // =========================================================
  // MANUAL ANSWER SUBMISSION (CLICK FINISH ANSWER)
  // =========================================================

  async function handleFinishAnswer() {
    if (isProcessingAnswer || isSubmittingRef.current || isProcessingAnswerRef.current) {
      return;
    }

    const answerToSubmit = (transcriptRef.current || transcript || "").trim();

    if (!answerToSubmit) {
      setMicGuidance("Please speak or enter your answer before clicking Finish Answer.");
      return;
    }

    setMicGuidance("");
    isSubmittingRef.current = true;
    stopListening();

    try {
      await submitAnswerToBackend(answerToSubmit);
    } finally {
      isSubmittingRef.current = false;
    }
  }

  // =========================================================
  // MAYA TEXT TO SPEECH
  // =========================================================
  async function speakQuestion(text) {
    if (!text) {
      console.log("No question to speak.");
      return;
    }

    // ==========================================
    // STOP MICROPHONE
    // ==========================================
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }
    isListeningRef.current = false;
    setIsListening(false);

    // ==========================================
    // STOP PREVIOUS SPEECH & AUDIO
    // ==========================================
    stopSpeakingAudio();

    // ==========================================
    // CLEAN TEXT FOR SPEECH
    // ==========================================
    const speechText = cleanSpeechText(text);

    console.log("📝 Original Maya text:", text);
    console.log("🔊 CLEAN Maya speech:", speechText);

    if (!speechText) {
      console.log("Nothing to speak after cleaning.");
      return;
    }

    const currentSpeechId = ++activeSpeechIdRef.current;

    const handleSpeechComplete = () => {
      if (currentSpeechId !== activeSpeechIdRef.current) return;

      console.log("Maya finished speaking");
      setIsSpeaking(false);

      if (pendingFinishRef.current) {
        const finalData = pendingFinishRef.current;
        pendingFinishRef.current = null;

        console.log("✅ Closing finished. Ending interview.");
        finishInterview(
          finalData.evaluation,
          finalData.question,
          finalData.answer
        );
        return;
      }

      if (isInterviewStartedRef.current) {
        console.log("🎙 Maya finished. Starting microphone...");
        setTimeout(() => {
          startListening();
        }, 80);
      }
    };

    speakWithBrowserSynthesis(speechText, handleSpeechComplete);
  }

  // =========================================================
  // START INTERVIEW
  // =========================================================

  function handleStartInterview() {
    setIsInterviewStarted(true);

    isInterviewStartedRef.current =
      true;

    setSeconds(0);

    console.log(
      "Current question:",
      currentQuestion
    );

    // Maya speaks first
    speakQuestion(
      currentQuestion
    );
  }

  // =========================================================
  // STOP INTERVIEW
  // =========================================================

  function handleStopInterview() {
    setShowQuitModal(true);
  }

  // =========================================================
  // QUIT INTERVIEW
  // =========================================================

  function handleQuit() {
    setShowQuitModal(true);
  }

  function confirmQuit() {
    setShowQuitModal(false);

    // Stop everything
    isInterviewStartedRef.current = false;
    shouldListenRef.current = false;

    stopSpeakingAudio();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log("Recognition already stopped.");
      }
    }

    setIsSpeaking(false);
    setIsListening(false);
    setIsInterviewStarted(false);
    setIsExited(true);
  }

  // =========================================================
  // LOADING & EXITED SCREENS
  // =========================================================

  if (!setup) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="font-medium text-slate-500">
          Preparing your interview...
        </p>
      </div>
    );
  }

  if (isExited) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <h2 className="mt-5 text-center text-2xl font-bold text-slate-900">
            Interview Session Exited
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-600">
            You ended this interview before completing all stages. Because this
            session was exited early, it has not been marked as completed and no
            final scorecard has been generated.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Time Elapsed
              </span>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                {formatTime(seconds)}
              </p>
            </div>
            <div className="border-l border-slate-200/60 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Questions Answered
              </span>
              <p className="mt-1 font-mono text-xl font-bold text-slate-900">
                {performance.questionsAnswered}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-500">
            <p className="leading-relaxed">
              <strong className="text-slate-700">Interview Track:</strong>{" "}
              {setup?.interviewType || "Technical"} ·{" "}
              {setup?.targetRole || "Software Engineer"}
            </p>
            <p className="mt-1 text-slate-400">
              Your unfinished session remains in the database for tracking, but
              will not affect your completed interview analytics or performance
              averages.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              Return to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate("/start-interview")}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <RotateCcw className="h-4 w-4" />
              Start New Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-50 flex flex-col justify-between">

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-12">

        {/* ============================= */}
        {/* TOP BAR */}
        {/* ============================= */}

        <div className="flex h-[52px] flex-shrink-0 items-center justify-between">

          <div>

            {!isInterviewStarted ? (
              <button
                type="button"
                onClick={handleStartInterview}
                className="
                  rounded-xl
                  bg-emerald-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-xs
                  transition
                  hover:bg-emerald-700
                  md:text-base
                "
              >
                Start Interview
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopInterview}
                className="
                  rounded-xl
                  bg-rose-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-xs
                  transition
                  hover:bg-rose-700
                  md:text-base
                "
              >
                Stop Interview
              </button>
            )}

          </div>

          {/* TIMER + QUIT */}

          <div className="flex items-center gap-5">

            <div className="text-right">

              <p className="text-xl font-mono font-bold text-slate-900 md:text-2xl">
                {formatTime(seconds)}
              </p>

              {!isInterviewStarted && (
                <p className="text-[10px] text-slate-400 font-medium">
                  Interview timer
                </p>
              )}

            </div>

            <button
              type="button"
              onClick={handleQuit}
              className="
                text-sm
                font-semibold
                text-rose-600
                transition
                hover:text-rose-700
                md:text-base
              "
            >
              Quit
            </button>

          </div>

        </div>

        {/* ============================= */}
        {/* INTERVIEWER AREA */}
        {/* ============================= */}

        <div className="mx-auto mt-2 h-[46vh] sm:h-[480px] lg:h-[540px] min-h-[300px] max-h-[620px] w-full max-w-[1400px]">

          <div
            className="
              relative
              h-full
              overflow-hidden
              rounded-[26px]
              border
              border-slate-200
              bg-gradient-to-b
              from-slate-100
              via-slate-50
              to-white
              shadow-xs
            "
          >

            {/* BACKGROUND */}

            <div
              className="
                absolute
                left-1/2
                top-[48%]
                h-[420px]
                w-[420px]
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-indigo-100/40
                blur-3xl
              "
            />

            {/* ============================= */}
            {/* MAYA AVATAR */}
            {/* ============================= */}

            <div
              className="
                absolute
                inset-0
                overflow-hidden
              "
            >

            <GLBAvatarTest
  speaking={isSpeaking}
  height="100%"
/>

            </div>

            {/* ============================= */}
            {/* MAYA LABEL */}
            {/* ============================= */}

            <div className="absolute bottom-5 left-5 z-20">

              <div
                className="
                  rounded-2xl
                  border
                  border-white/80
                  bg-white/90
                  px-4
                  py-2.5
                  shadow-sm
                  backdrop-blur-md
                "
              >

                <p className="text-sm font-bold text-slate-900">
                  Maya AI
                </p>

                <div className="mt-0.5 flex items-center gap-2">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSpeaking
                        ? "bg-indigo-600 animate-pulse"
                        : isProcessingAnswer
                        ? "bg-amber-500 animate-pulse"
                        : isListening
                        ? "bg-rose-500 animate-ping"
                        : "bg-emerald-500"
                    }`}
                  />

                  <p className="text-xs font-medium text-slate-500">

                    {isSpeaking
                      ? "Speaking..."
                      : isProcessingAnswer
                      ? "Thinking..."
                      : isListening
                      ? "Listening to candidate..."
                      : isHRInterview
                      ? "HR Interviewer"
                      : "Technical Interviewer"}

                  </p>

                </div>

              </div>

            </div>


          </div>

        </div>

        {/* ============================= */}
        {/* CURRENT QUESTION */}
        {/* ============================= */}

        {isInterviewStarted && (
          <div className="mt-3 w-full flex-shrink-0">

            <div
              className="
                mx-auto
                max-w-5xl
                rounded-2xl
                bg-indigo-50/80
                border
                border-indigo-100
                px-6
                py-3.5
                shadow-xs
              "
            >

              <p className="text-center text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Maya · {isHRInterview ? "HR Interview" : "Technical Interview"}
              </p>

              <p
                className="
                  mt-1
                  text-center
                  text-sm
                  font-semibold
                  leading-relaxed
                  text-slate-900
                  md:text-base
                "
              >
                {mayaResponseText || currentQuestion}
              </p>

            </div>

          </div>
        )}

        {/* ============================= */}
        {/* LIVE TRANSCRIPT */}
        {/* ============================= */}

        {isInterviewStarted && transcript && (
          <div className="mx-auto mt-2 w-full max-w-5xl">
            <div className="rounded-2xl border border-indigo-100 bg-white px-5 py-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isListening ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  {isListening ? "Live Response Transcript" : "Review Answer Before Submitting"}
                </span>
                <span className="text-[10px] text-slate-400">Click Finish Answer when done</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed">
                {transcript}
              </p>
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* FINISH ANSWER BUTTON & MANUAL INPUT */}
        {/* ============================= */}

        {isInterviewStarted && !isSpeaking && (
          <div className="mt-3 flex flex-col items-center gap-2">
            {micGuidance && (
              <p className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-center max-w-md">
                {micGuidance}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleFinishAnswer}
                disabled={isProcessingAnswer || isSpeaking}
                className="
                  flex items-center gap-2
                  rounded-xl
                  bg-indigo-600
                  px-6
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-indigo-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                  md:text-base
                "
              >
                {isProcessingAnswer ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Maya is thinking...</span>
                  </>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Maya is speaking...</span>
                  </div>
                ) : (
                  <span>Finish Answer</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================= */}
        {/* QUIT CONFIRMATION MODAL */}
        {/* ============================= */}
        {showQuitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">
                    Quit Interview Session?
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    Are you sure you want to exit? Your session progress will be stopped. Early exits are not scored as completed interviews.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuitModal(false)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  Continue Interview
                </button>
                <button
                  type="button"
                  onClick={confirmQuit}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 transition"
                >
                  Quit Session
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default Interview;