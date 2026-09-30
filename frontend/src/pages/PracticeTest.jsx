import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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
          "http://localhost:8081/api/practice/generate",
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
          "We couldn't generate your questions. Please try starting the test again."
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
      handleSubmit();
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

  // =========================
  // FORMAT TIMER
  // =========================

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  // =========================
  // SELECT ANSWER
  // =========================

  const handleAnswerSelect = (optionIndex) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: optionIndex,
    }));
  };

  // =========================
  // NEXT QUESTION
  // =========================

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  };

  // =========================
  // PREVIOUS QUESTION
  // =========================

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  };

  // =========================
  // SUBMIT TEST
  // =========================

  function handleSubmit() {
    if (isSubmitted) {
      return;
    }

    setIsSubmitted(true);

    const score = questions.reduce((total, question, index) => {
      return total + (
        answers[index] === question.answer ? 1 : 0
      );
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

  const question = questions[currentQuestion];

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-[#F8F7FC]">
        <Navbar />

        <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:px-8">
          <section className="rounded-[24px] border border-purple-100 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#E7E0FF] border-t-[#6D4DE8]" />

            <h1 className="mt-6 text-2xl font-extrabold text-slate-950">
              Preparing Your Test
            </h1>

            <p className="mt-3 text-slate-500">
              Generating 30 {difficulty.toLowerCase()} questions for{" "}
              {section}.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              This may take a few seconds.
            </p>

          </section>
        </main>
      </div>
    );
  }

  if (questionError) {
    return (
      <div className="min-h-screen bg-[#F8F7FC]">
        <Navbar />

        <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 md:px-8">
          <section className="rounded-[24px] border border-red-100 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
              Unable to Prepare Test
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              {questionError}
            </p>

            <button
              type="button"
              onClick={() => navigate("/practice-questions")}
              className="mt-7 rounded-xl bg-[#6D4DE8] px-7 py-3.5 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1]"
            >
              Back to Practice Questions
            </button>

          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8">

        {/* HEADER */}
        <section className="rounded-[24px] border border-purple-100 bg-white p-6 shadow-sm md:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8A78C8]">
                Practice Test
              </p>

              <h1 className="mt-1 text-2xl font-extrabold text-slate-950">
                {section}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {difficulty} Difficulty
              </p>
            </div>

            {/* TIMER */}
            <div
              className={`rounded-xl px-5 py-3 text-center ${
                timeLeft <= 300
                  ? "bg-red-50 text-red-600"
                  : "bg-[#F1EDFF] text-[#6D4DE8]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                Time Remaining
              </p>

              <p className="mt-1 text-2xl font-extrabold">
                {minutes}:{seconds}
              </p>
            </div>

          </div>

        </section>

        {/* PROGRESS */}
        <div className="mt-6 flex items-center justify-between">

          <p className="text-sm font-semibold text-slate-700">
            Question {currentQuestion + 1} of {questions.length}
          </p>

          <p className="text-sm text-slate-500">
            {Object.keys(answers).length} answered
          </p>

        </div>

        {/* QUESTION */}
        <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <h2 className="text-lg font-bold leading-7 text-slate-950 md:text-xl">
            {question.question}
          </h2>

          <div className="mt-7 space-y-3">

            {question.options.map((option, index) => {
              const isSelected =
                answers[currentQuestion] === index;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswerSelect(index)}
                  className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-[#6D4DE8] bg-[#F5F1FF]"
                      : "border-slate-200 hover:border-[#B9A8F2] hover:bg-slate-50"
                  }`}
                >

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      isSelected
                        ? "border-[#6D4DE8] bg-[#6D4DE8] text-white"
                        : "border-slate-300 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>

                  <span className="font-medium text-slate-800">
                    {option}
                  </span>

                </button>
              );
            })}

          </div>

        </section>

        {/* NAVIGATION */}
        <div className="mt-6 flex items-center justify-between">

          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-[#6D4DE8] px-7 py-3 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1]"
            >
              Submit Test
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-xl bg-[#6D4DE8] px-7 py-3 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1]"
            >
              Next →
            </button>
          )}

        </div>

      </main>
    </div>
  );
}

export default PracticeTest;