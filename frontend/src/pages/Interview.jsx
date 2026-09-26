import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import GLBAvatarTest from "./GLBAvatarTest";

function Interview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);
  const [seconds, setSeconds] = useState(0);

  const [isInterviewStarted, setIsInterviewStarted] =
    useState(false);

  const [currentQuestion, setCurrentQuestion] =
    useState("");

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

    setCurrentQuestion(
      parsedSetup.firstQuestion ||
        "Unable to load the interview question."
    );
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
  // START SPEECH RECOGNITION
  // =========================================================

  function startListening() {
    if (!isInterviewStartedRef.current) {
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

      for (
        let i = 0;
        i < event.results.length;
        i++
      ) {
        completeTranscript +=
          event.results[i][0].transcript + " ";
      }

      completeTranscript =
        completeTranscript.trim();

      console.log(
        "📝 Transcript:",
        completeTranscript
      );

      transcriptRef.current =
        completeTranscript;

      setTranscript(
        completeTranscript
      );

      // =========================
      // SPEECH BOUNDARY
      // =========================

      setSpeechBoundary(
        (previous) => previous + 1
      );

      // =========================
      // RESET SILENCE TIMER
      // =========================

      if (silenceTimerRef.current) {
        clearTimeout(
          silenceTimerRef.current
        );
      }

      silenceTimerRef.current =
        setTimeout(() => {
          console.log(
            "🤫 Silence detected. Stopping microphone."
          );

          stopListening();
        }, 1800);
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
        }, 300);
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

  // =========================================================
  // SUBMIT ANSWER TO BACKEND
  // =========================================================

  async function submitAnswerToBackend() {
    const answer = transcriptRef.current.trim();
    console.log("🔥 SUBMIT ANSWER FUNCTION CALLED");
console.log("Setup:", setup);
console.log("Interview ID:", setup?.interviewId);
console.log("Current Question:", currentQuestion);
console.log("Transcript:", answer);

    if (!answer) {
      console.log("No answer to submit.");
      return;
    }

    if (!setup?.interviewId) {
      console.error("Interview ID is missing.");
      return;
    }

    if (!currentQuestion) {
      console.error("Current question is missing.");
      return;
    }

    if (isProcessingAnswer) {
      console.log("Answer is already being processed.");
      return;
    }

    console.log("================================");
    console.log("📤 SUBMITTING ANSWER");
    console.log("Interview ID:", setup.interviewId);
    console.log("Question:", currentQuestion);
    console.log("Answer:", answer);
    console.log("================================");

    setIsProcessingAnswer(true);

    try {
      const token = localStorage.getItem("token");

     const response = await axios.post(
`${import.meta.env.VITE_API_URL}/api/interviews/answer`,
  {
    interviewId: setup.interviewId,
    userAnswer: answer,
    currentQuestion: currentQuestion,
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

      console.log("================================");
      console.log("✅ BACKEND RESPONSE");
      console.log(response.data);
      console.log("================================");

      const nextQuestion =
        response.data?.nextQuestion;

      if (!nextQuestion) {
        console.error(
          "Backend did not return a next question."
        );
        return;
      }

      // Update question on screen
      setCurrentQuestion(nextQuestion);

      // Clear previous transcript
      transcriptRef.current = "";
      setTranscript("");

      // Maya speaks the next question
      speakQuestion(nextQuestion);

    } catch (error) {
      console.error(
        "❌ Failed to submit answer:",
        error
      );

      if (error.response) {
        console.error(
          "Backend status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );
      }
    } finally {
      setIsProcessingAnswer(false);
    }
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
      console.log(
        "No question to speak."
      );

      return;
    }

    // Make absolutely sure microphone is OFF
    shouldListenRef.current = false;

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

    // Stop any previous speech
    window.speechSynthesis.cancel();

    // Make sure speech engine is active
    window.speechSynthesis.resume();

    const speech =
      new SpeechSynthesisUtterance();

    // =========================
    // TEXT
    // =========================

    speech.text = text;

    // =========================
    // FIND CLEAR ENGLISH VOICE
    // =========================

    const voices =
      window.speechSynthesis.getVoices();

    console.log(
      "Available voices:",
      voices.map(
        (voice) => voice.name
      )
    );

    const preferredVoice =
      voices.find((voice) =>
        voice.name
          .toLowerCase()
          .includes("samantha")
      ) ||
      voices.find((voice) =>
        voice.name
          .toLowerCase()
          .includes("ava")
      ) ||
      voices.find((voice) =>
        voice.name
          .toLowerCase()
          .includes(
            "google us english"
          )
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
      speech.voice =
        preferredVoice;

      console.log(
        "Maya voice selected:",
        preferredVoice.name,
        preferredVoice.lang
      );
    } else {
      console.log(
        "No preferred voice found. Using browser default."
      );
    }

    // =========================
    // VOICE SETTINGS
    // =========================

    speech.lang = "en-US";

    speech.rate = 0.82;

    speech.pitch = 1.05;

    speech.volume = 1;

    // =========================
    // SPEECH START
    // =========================

    speech.onstart = () => {
      console.log(
        "Maya started speaking"
      );

      setIsSpeaking(true);

      // Microphone MUST remain OFF
      shouldListenRef.current =
        false;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log(
            "Recognition already stopped."
          );
        }
      }

      setIsListening(false);
    };

    // =========================
    // SPEECH BOUNDARY
    // =========================

    speech.onboundary = (event) => {
      console.log(
        "🗣️ Speech boundary:",
        event.name,
        "char:",
        event.charIndex
      );

      setSpeechBoundary(
        (previous) => previous + 1
      );
    };

    // =========================
    // SPEECH END
    // =========================

    speech.onend = () => {
      console.log(
        "Maya finished speaking"
      );

      setIsSpeaking(false);

      // ==========================================
      // AUTOMATICALLY START MICROPHONE
      // ==========================================

      if (
        isInterviewStartedRef.current
      ) {
        console.log(
          "🎙 Maya finished. Starting microphone..."
        );

        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    // =========================
    // SPEECH ERROR
    // =========================

    speech.onerror = (event) => {
      console.error(
        "Maya speech error:",
        event.error
      );

      setIsSpeaking(false);

      /*
       * If speech failed while the interview
       * is active, still allow the candidate
       * to answer.
       */

      if (
        isInterviewStartedRef.current
      ) {
        setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    // =========================
    // SPEAK
    // =========================

    setTimeout(() => {
      console.log(
        "Speaking question:",
        text
      );

      window.speechSynthesis.speak(
        speech
      );
    }, 150);
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
                speechBoundary={
                  speechBoundary
                }
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
                      : "AI Interviewer"}

                  </p>

                </div>

              </div>

            </div>

            {/* ============================= */}
            {/* INTERVIEW STATUS */}
            {/* ============================= */}

            {isInterviewStarted && (
              <div className="absolute bottom-5 right-5 z-20">

                <div
                  className="
                    rounded-full
                    border
                    border-white/60
                    bg-white/90
                    px-4
                    py-2
                    text-xs
                    font-semibold
                    text-slate-700
                    shadow-sm
                    backdrop-blur-md
                  "
                >

                  {isSpeaking
                    ? "🔊 Maya is speaking"
                    : isListening
                    ? "🎙 Listening..."
                    : isProcessingAnswer
                    ? "⏳ Evaluating your answer..."
                    : "⏳ Preparing..."}

                </div>

              </div>
            )}

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
                Maya
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
                {currentQuestion}
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

      </main>

    </div>
  );
}

export default Interview;