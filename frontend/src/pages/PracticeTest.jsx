import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Loader2,
  FileText,
  HelpCircle,
  Check
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PracticeTest() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    section = "Practice",
    difficulty = "Medium",
  } = location.state || {};

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const questionsLoadedRef = useRef(false);

  useEffect(() => {
    if (questionsLoadedRef.current) {
      return;
    }

    questionsLoadedRef.current = true;

    const loadQuestions = async () => {
      try {
        setIsLoadingQuestions(true);
        setQuestionError("");

        const token = localStorage.getItem("token");

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/practice/generate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              section,
              difficulty,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to generate questions (${response.status})`
          );
        }

        const generatedQuestions = await response.json();

        if (!Array.isArray(generatedQuestions)) {
          throw new Error("Invalid question data received from server.");
        }

        if (generatedQuestions.length === 0) {
          throw new Error("No questions were generated.");
        }

        setQuestions(generatedQuestions);
        setCurrentQuestion(0);
        setAnswers({});
      } catch (error) {
        console.error("Failed to generate practice questions:", error);
        setQuestionError(
          "We couldn't generate your questions right now. Please check your connection and try starting the test again."
        );
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [section, difficulty]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    if (isLoadingQuestions || questions.length === 0) {
      return;
    }

    if (timeLeft <= 0 && !isSubmitted) {
      confirmSubmit();
      return;
    }

    if (isSubmitted) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, isLoadingQuestions, questions.length]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  // =========================
  // ANSWER SELECT
  // =========================
  const handleAnswerSelect = (optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  function confirmSubmit() {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setShowSubmitModal(false);

    const score = questions.reduce((total, question, index) => {
      return total + (answers[index] === question.answer ? 1 : 0);
    }, 0);

    navigate("/practice-results", {
      state: {
        section,
        difficulty,
        score,
        totalQuestions: questions.length,
        answers,
        questions,
      },
    });
  }

  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // LOADING STATE
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 sm:p-14 text-center shadow-xs max-w-lg w-full space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-indigo-600" />

            <h1 className="text-2xl font-extrabold text-slate-900">
              Generating Practice Test
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              Curating 30 {difficulty.toLowerCase()} questions for <strong className="text-slate-800">{section}</strong>. Calibrating question diversity and multiple choice options...
            </p>

            <span className="inline-block text-xs text-slate-400 font-medium">
              This usually completes in a few moments.
            </span>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // ERROR STATE
  if (questionError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 flex items-center justify-center">
          <div className="rounded-3xl border border-rose-200 bg-white p-10 sm:p-14 text-center shadow-xs max-w-lg w-full space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900">
              Unable to Prepare Test
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">
              {questionError}
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate("/practice-questions")}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition"
              >
                Back to Practice Questions
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* TOP STATUS HEADER */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Placement Practice Exam
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {difficulty}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {section}
            </h1>
          </div>

          {/* Quick Metrics (Timer & Questions Count) */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2.5 rounded-2xl border text-center font-mono ${
              timeLeft <= 300
                ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
                : "bg-slate-50 border-slate-200 text-slate-900"
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-lg font-black tracking-tight">{minutes}:{seconds}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Test
            </button>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* MAIN COLUMN (8 cols): Question & Options */}
          <div className="lg:col-span-8 space-y-6">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6 transition-all duration-200">
              
              {/* Question Index & Status */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-black">
                    {currentQuestion + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  answers[currentQuestion] !== undefined
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-100 text-slate-500"
                }`}>
                  {answers[currentQuestion] !== undefined ? "Answered" : "Unanswered"}
                </span>
              </div>

              {/* Question Statement */}
              <h2 className="text-base sm:text-lg font-bold leading-relaxed text-slate-900">
                {question.question}
              </h2>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {question.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  const optionLabel = String.fromCharCode(65 + index);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswerSelect(index)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600/30"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-black transition-colors ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {optionLabel}
                      </div>

                      <span className="text-sm font-medium text-slate-800 leading-snug">
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation Controls */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {currentQuestion === questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
                  >
                    Finish & Submit
                    <Send className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

          </div>

          {/* SIDEBAR COLUMN (4 cols): Progress & Question Palette */}
          <div className="lg:col-span-4 space-y-6">

            {/* Test Progress Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Progress Overview</span>
                <span className="text-indigo-600">{answeredCount} of {questions.length} answered</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{progressPercent}% Complete</span>
                <span>{questions.length - answeredCount} remaining</span>
              </div>
            </div>

            {/* Question Navigator Palette */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Question Palette
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Click to jump</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-[10px] text-slate-500 pb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                  Answered
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300" />
                  Unanswered
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm ring-2 ring-indigo-600 bg-white" />
                  Current
                </span>
              </div>

              {/* Grid of 30 Buttons */}
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-6 gap-2">
                {questions.map((_, index) => {
                  const isCurrent = index === currentQuestion;
                  const isAnswered = answers[index] !== undefined;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentQuestion(index)}
                      className={`h-9 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "ring-2 ring-indigo-600 ring-offset-1 bg-indigo-600 text-white"
                          : isAnswered
                          ? "bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* CONFIRM SUBMISSION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Submit Practice Test?
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  You have answered <strong className="text-slate-800">{answeredCount} of {questions.length}</strong> questions.
                  {questions.length - answeredCount > 0 && (
                    <span className="block mt-1 text-amber-600 font-semibold">
                      Note: You have {questions.length - answeredCount} unanswered questions remaining.
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-500 transition"
              >
                Yes, Submit Test
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default PracticeTest;