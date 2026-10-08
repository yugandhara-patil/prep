import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import GLBAvatarTest from "./GLBAvatarTest";

function Interview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);

  const isHRInterview =
    String(setup?.interviewType || "").toUpperCase() === "HR";

  const [seconds, setSeconds] = useState(0);

  const [isInterviewStarted, setIsInterviewStarted] =
    useState(false);

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

  const silenceTimerRef = useRef(null);

  const shouldListenRef = useRef(false);

  const transcriptRef = useRef("");

  const isListeningRef = useRef(false);

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
      window.speechSynthesis.cancel();

      shouldListenRef.current = false;

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
    return String(text || "")
      .replace(/\b(no|yes|okay|ok)\s+\1\b/gi, "$1")
      .replace(/\s+/g, " ")
      .trim();
  }

  // =========================================================
  // CLEAN MAYA SPEECH
  // =========================================================

  function cleanSpeechText(text) {
  return String(text || "")
    // Remove ALL punctuation and symbols
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    // Remove extra spaces
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
      let completeTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        completeTranscript += event.results[i][0].transcript + " ";
      }

      completeTranscript = cleanTranscript(completeTranscript);

      console.log("📝 Transcript:", completeTranscript);

      transcriptRef.current = completeTranscript;
      setTranscript(completeTranscript);
    };

    // =========================
    // RECOGNITION ERROR
    // =========================

    recognition.onerror = (event) => {
      console.error(
        "🎙 Speech recognition error:",
        event.error
      );

      if (
        event.error ===
        "not-allowed"
      ) {
        setTranscript(
          "Microphone permission was denied. Please allow microphone access."
        );
      }

      if (
        event.error ===
        "audio-capture"
      ) {
        setTranscript(
          "No microphone was detected."
        );
      }
    };

    // =========================
    // RECOGNITION END
    // =========================

    recognition.onend = () => {
      console.log(
        "🎙 Speech recognition ended"
      );

      isListeningRef.current = false;

      setIsListening(false);

      /*
       * Chrome/Safari can sometimes stop recognition
       * automatically even when continuous=true.
       *
       * If the interview is still active and we did
       * not intentionally stop listening, start again.
       */

      if (
        shouldListenRef.current &&
        isInterviewStartedRef.current &&
        !transcriptRef.current
      ) {
        setTimeout(() => {
          if (
            shouldListenRef.current &&
            isInterviewStartedRef.current &&
            !isListeningRef.current
          ) {
            startListening();
          }
        }, 80);
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

  async function submitAnswerToBackend() {
    const answer = transcriptRef.current.trim();

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

    if (isProcessingAnswer) {
      console.log("Answer is already being processed.");
      return;
    }

    const token = localStorage.getItem("token");

    setIsProcessingAnswer(true);

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
      const evaluationType = String(evaluation).toUpperCase();

      const isCorrection =
        evaluationType === "INCORRECT" ||
        evaluationType === "PARTIALLY_CORRECT";

      if (isCorrection) {
        // Keep the ORIGINAL question active.
        // The candidate must answer the same question again.
        conversationStageRef.current = stageBeingAnswered;
        setConversationStage(stageBeingAnswered);

        currentQuestionRef.current = questionBeingAnswered;
        setCurrentQuestion(questionBeingAnswered);
      } else {
        // Normal interview flow.
        conversationStageRef.current = nextStage;
        setConversationStage(nextStage);

        currentQuestionRef.current = nextQuestion;
        setCurrentQuestion(nextQuestion);
      }

      transcriptRef.current = "";
      setTranscript("");

 // =========================================================
// MAYA SPOKEN RESPONSE
// =========================================================

      const isCandidateQuestionsClosing =
        stageBeingAnswered === "CANDIDATE_QUESTIONS" &&
        nextStage === "CLOSING";

      console.log("Evaluation:", evaluation);
      console.log("Next stage:", nextStage);
      console.log(
        "Candidate questions closing:",
        isCandidateQuestionsClosing
      );

      if (isCorrection) {
        let spokenFeedback = feedback.trim();

        if (evaluationType === "PARTIALLY_CORRECT"
            && !spokenFeedback.toLowerCase().startsWith("your answer is partially correct")) {
          spokenFeedback =
            "Your answer is partially correct."
            + (spokenFeedback ? " " + spokenFeedback : "");
        }

 if (evaluationType === "INCORRECT") {
  const normalizedAnswer = answer
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const isIDontKnow =
    normalizedAnswer.includes("i dont know") ||
    normalizedAnswer.includes("i do not know") ||
    normalizedAnswer.includes("dont know") ||
    normalizedAnswer.includes("do not know") ||
    normalizedAnswer.includes("not sure") ||
    normalizedAnswer.includes("no idea") ||
    normalizedAnswer.includes("i have no idea");

  if (isIDontKnow) {
    spokenFeedback = spokenFeedback
      .replace(/^No, your answer is incorrect\.\s*/i, "")
      .replace(/^Your answer is incorrect\.\s*/i, "")
      .trim();

    spokenFeedback =
      "It is okay."
      + (spokenFeedback ? " " + spokenFeedback : "");
  } else if (
    !spokenFeedback.toLowerCase().startsWith("your answer is incorrect") &&
    !spokenFeedback.toLowerCase().startsWith("no, your answer is incorrect")
  ) {
    spokenFeedback =
      "No, your answer is incorrect."
      + (spokenFeedback ? " " + spokenFeedback : "");
  }
}

        // Maya only gives the correction.
        // She must NOT speak the next question yet.
        // After the correction finishes, the microphone will start
        // so the candidate can answer the SAME question again.
        pendingNextQuestionRef.current = null;

        console.log("🗣 Maya correction:", spokenFeedback);
        console.log("🔁 Candidate will retry:", questionBeingAnswered);

        setMayaResponseText(spokenFeedback);
        speakQuestion(spokenFeedback);
      } else if (isCandidateQuestionsClosing) {
        // "No" is handled as the final candidate response.
        // Maya speaks the closing once and the interview ends.
        pendingNextQuestionRef.current = null;

        pendingFinishRef.current = {
          evaluation,
          question: nextQuestion,
          answer,
        };

        console.log("🗣 Maya closing:", nextQuestion);

        setMayaResponseText(nextQuestion);
        speakQuestion(nextQuestion);
  } else {
  pendingNextQuestionRef.current = null;

  const isTechnicalStage =
    stageBeingAnswered === "TECHNICAL_1" ||
    stageBeingAnswered === "TECHNICAL_2" ||
    stageBeingAnswered === "TECHNICAL_3" ||
    stageBeingAnswered === "TECHNICAL_4" ||
    stageBeingAnswered === "TECHNICAL_5" ||
    stageBeingAnswered === "TECHNICAL_6";

  const spokenResponse = isTechnicalStage
    ? `Yes, that’s correct. ${nextQuestion}`
    : nextQuestion;

  setMayaResponseText(spokenResponse);
  speakQuestion(spokenResponse);
}

    } catch (error) {
      console.error("❌ Failed to submit answer:", error);

      if (error.response) {
        console.error("Backend status:", error.response.status);
        console.error("Backend response:", error.response.data);
      }
    } finally {
      setIsProcessingAnswer(false);
    }
  }

  // =========================================================
  // FINISH INTERVIEW
  // =========================================================

  function finishInterview(finalEvaluation, finalQuestion, finalAnswer) {
    isInterviewStartedRef.current = false;
    shouldListenRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    window.speechSynthesis.cancel();

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

    if (silenceTimerRef.current) {
      clearTimeout(
        silenceTimerRef.current
      );

      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }
    }

    isListeningRef.current = false;

    setIsListening(false);

    console.log(
      "🎙 Microphone stopped"
    );

    // ==========================================
    // SUBMIT FINAL ANSWER
    // ==========================================

    if (transcriptRef.current.trim()) {
      submitAnswerToBackend();
    }
  }

  // =========================================================
  // MAYA TEXT TO SPEECH
  // =========================================================
function speakQuestion(text) {
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
  // STOP PREVIOUS SPEECH
  // ==========================================

  window.speechSynthesis.cancel();

  // ==========================================
  // CLEAN TEXT FOR SPEECH
  // ==========================================

  const speechText = String(text || "")
    // Remove punctuation completely
    .replace(/[.,!?;:()[\]{}"'“”‘’\-—_]/g, "")
    // Remove any remaining symbols
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    // Normalise spaces
    .replace(/\s+/g, " ")
    .trim();

  console.log("📝 Original Maya text:", text);
  console.log("🔊 CLEAN Maya speech:", speechText);

  if (!speechText) {
    console.log("Nothing to speak after cleaning.");
    return;
  }

  // ==========================================
  // CREATE SPEECH
  // ==========================================

  const speech = new SpeechSynthesisUtterance();

  // VERY IMPORTANT:
  // Only the cleaned text goes into speech.text
  speech.text = speechText;

  // ==========================================
  // VOICE
  // ==========================================

  const voices = window.speechSynthesis.getVoices();

  const preferredVoice =
    voices.find((voice) =>
      voice.name.toLowerCase().includes("samantha")
    ) ||
    voices.find((voice) =>
      voice.name.toLowerCase().includes("ava")
    ) ||
    voices.find((voice) =>
      voice.name.toLowerCase().includes("google us english")
    ) ||
    voices.find(
      (voice) =>
        voice.lang === "en-US" &&
        voice.localService === true
    ) ||
    voices.find((voice) =>
      voice.lang.startsWith("en")
    );

  if (preferredVoice) {
    speech.voice = preferredVoice;

    console.log(
      "Maya voice selected:",
      preferredVoice.name,
      preferredVoice.lang
    );
  }

  // ==========================================
  // VOICE SETTINGS
  // ==========================================

  speech.lang = "en-US";
  speech.rate = 1.0;
  speech.pitch = 1.05;
  speech.volume = 1;

  // ==========================================
  // SPEECH START
  // ==========================================

  speech.onstart = () => {
    console.log("Maya started speaking");

    setIsSpeaking(true);

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
  };

  // ==========================================
  // SPEECH BOUNDARY
  // ==========================================

  speech.onboundary = (event) => {
    if (event.name === "word") {
      console.log(
        "🗣️ Speech boundary:",
        event.charIndex
      );

      setSpeechBoundary(
        (previous) => previous + 1
      );
    }
  };

  // ==========================================
  // SPEECH END
  // ==========================================

speech.onend = () => {
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

  // After Maya finishes speaking, start listening
  // for the candidate's answer.
  if (isInterviewStartedRef.current) {
    console.log(
      "🎙 Maya finished. Starting microphone..."
    );

    setTimeout(() => {
      startListening();
    }, 80);
  }
};

  // ==========================================
  // SPEECH ERROR
  // ==========================================
speech.onerror = (event) => {
  console.error(
    "Maya speech error:",
    event.error
  );

  setIsSpeaking(false);

  if (pendingFinishRef.current) {
    const finalData = pendingFinishRef.current;
    pendingFinishRef.current = null;

    finishInterview(
      finalData.evaluation,
      finalData.question,
      finalData.answer
    );

    return;
  }

  if (isInterviewStartedRef.current) {
    setTimeout(() => {
      startListening();
    }, 80);
  }
};
  // ==========================================
  // SPEAK
  // ==========================================

  console.log(
    "🔊 FINAL TEXT SENT TO SPEECH ENGINE:",
    speech.text
  );

  window.speechSynthesis.resume();

  window.speechSynthesis.speak(speech);
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
    const confirmStop =
      window.confirm(
        "Are you sure you want to stop the interview?"
      );

    if (!confirmStop) return;

    // Stop everything
    isInterviewStartedRef.current =
      false;

    shouldListenRef.current =
      false;

    window.speechSynthesis.cancel();

    if (silenceTimerRef.current) {
      clearTimeout(
        silenceTimerRef.current
      );
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }
    }

    setIsSpeaking(false);
    setIsListening(false);
    setIsInterviewStarted(false);

    navigate("/home");
  }

  // =========================================================
  // QUIT INTERVIEW
  // =========================================================

  function handleQuit() {
    const confirmQuit =
      window.confirm(
        "Are you sure you want to quit the interview?"
      );

    if (!confirmQuit) return;

    // Stop everything
    isInterviewStartedRef.current =
      false;

    shouldListenRef.current =
      false;

    window.speechSynthesis.cancel();

    if (silenceTimerRef.current) {
      clearTimeout(
        silenceTimerRef.current
      );
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log(
          "Recognition already stopped."
        );
      }
    }

    setIsSpeaking(false);
    setIsListening(false);
    setIsInterviewStarted(false);

    navigate("/home");
  }

  // =========================================================
  // LOADING
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

  return (
    <div className="h-screen overflow-hidden bg-slate-50">

      <main className="flex h-screen w-full flex-col px-6 py-4">

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
                  bg-green-600
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-green-700
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
                  bg-red-500
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-600
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

              <p className="text-xl font-bold text-slate-950 md:text-2xl">
                {formatTime(seconds)}
              </p>

              {!isInterviewStarted && (
                <p className="text-[10px] text-slate-400">
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
                text-red-600
                transition
                hover:text-red-700
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

        <div className="mx-auto mt-2 h-[650px] w-full max-w-[1500px]">

          <div
            className="
              relative
              h-full
              overflow-hidden
              rounded-[26px]
              border
              border-slate-200
              bg-gradient-to-b
              from-[#f1f0f8]
              via-[#f7f7fb]
              to-white
              shadow-sm
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
                bg-white/70
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
                  border-white/60
                  bg-white/90
                  px-4
                  py-2.5
                  shadow-sm
                  backdrop-blur-md
                "
              >

                <p className="text-sm font-bold text-slate-900">
                  Maya
                </p>

                <div className="mt-0.5 flex items-center gap-2">

                  <span
                    className={`h-2 w-2 rounded-full ${
                      isSpeaking
                        ? "bg-purple-500"
                        : isListening
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  />

                  <p className="text-xs font-medium text-slate-500">

                    {isSpeaking
                      ? "Speaking..."
                      : isListening
                      ? "Listening..."
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
                bg-[#EAE4F7]
                px-6
                py-3
                shadow-sm
              "
            >

              <p className="text-center text-xs font-medium text-purple-600">
                Maya · {isHRInterview ? "HR Interview" : "Technical Interview"}
              </p>

              <p
                className="
                  mt-1
                  text-center
                  text-sm
                  font-semibold
                  leading-6
                  text-slate-950
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

        {isInterviewStarted &&
          isListening &&
          transcript && (
            <div className="mx-auto mt-2 w-full max-w-5xl">

              <div
                className="
                  rounded-2xl
                  border
                  border-red-100
                  bg-white
                  px-5
                  py-2
                  shadow-sm
                "
              >

                <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-red-500">
                  Your answer
                </p>

                <p className="mt-1 text-center text-sm text-slate-700">
                  {transcript}
                </p>

              </div>

            </div>
          )}

        {/* ============================= */}
        {/* FINISH ANSWER BUTTON */}
        {/* ============================= */}

        {isInterviewStarted && isListening && (
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={stopListening}
              disabled={isProcessingAnswer}
              className="
                rounded-xl
                bg-purple-600
                px-6
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-purple-700
                disabled:cursor-not-allowed
                disabled:opacity-50
                md:text-base
              "
            >
              {isProcessingAnswer ? "Processing..." : "Finish Answer"}
            </button>
          </div>
        )}

      </main>

    </div>
  );
}

export default Interview;