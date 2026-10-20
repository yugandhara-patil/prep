import { useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Check,
  ChevronLeft
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PracticeResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    section,
    difficulty,
    score = 0,
    totalQuestions = 0,
    answers = {},
    questions = [],
  } = location.state || {};

  const [filterType, setFilterType] = useState("ALL"); // ALL, CORRECT, INCORRECT, UNANSWERED

  const result = useMemo(() => {
    const correct = questions.reduce((total, question, index) => {
      return total + (answers[index] === question.answer ? 1 : 0);
    }, 0);

    const answered = Object.keys(answers).length;
    const incorrect = answered - correct;
    const unanswered = Math.max(0, totalQuestions - answered);
    const percentage =
      totalQuestions > 0
        ? Math.round((correct / totalQuestions) * 100)
        : 0;

    return {
      correct,
      incorrect,
      unanswered,
      percentage,
    };
  }, [answers, questions, totalQuestions]);

  const filteredQuestions = useMemo(() => {
    return questions
      .map((q, idx) => ({ ...q, originalIndex: idx }))
      .filter((q) => {
        const userAns = answers[q.originalIndex];
        const isAnswered = userAns !== undefined;
        const isCorrect = userAns === q.answer;

        if (filterType === "CORRECT") return isCorrect;
        if (filterType === "INCORRECT") return isAnswered && !isCorrect;
        if (filterType === "UNANSWERED") return !isAnswered;
        return true;
      });
  }, [questions, answers, filterType]);

  if (!location.state) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              No Practice Results Found
            </h1>

            <p className="text-xs text-slate-500 leading-relaxed">
              Please take a practice test to view your scorecard and answer analysis.
            </p>

            <button
              onClick={() => navigate("/practice-questions")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
            >
              Go to Practice Questions
            </button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  function handleRetake() {
    navigate("/practice-test", {
      state: {
        section,
        difficulty,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Back Link */}
        <div>
          <Link
            to="/practice-questions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Practice Questions
          </Link>
        </div>

        {/* ================= HERO SCORECARD BANNER ================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-50/70 pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 8 Cols */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  Practice Assessment Completed
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  {difficulty} Level
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {section} Test Scorecard
              </h1>

              <p className="text-sm text-slate-500 max-w-xl">
                Comprehensive breakdown of your accuracy, completed questions, and detailed conceptual explanations.
              </p>
            </div>

            {/* Right 4 Cols: Score Ring */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="w-full sm:w-auto min-w-[200px] p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Final Score
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {score}
                  <span className="text-lg font-bold text-slate-400 ml-1">/ {totalQuestions}</span>
                </div>
                <div className="mt-2 text-sm font-extrabold text-indigo-600">
                  {result.percentage}% Accuracy
                </div>
              </div>
            </div>

          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-xs text-emerald-700 block font-medium">Correct Answers</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {result.correct}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 text-center">
              <span className="text-xs text-rose-700 block font-medium">Incorrect Answers</span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                {result.incorrect}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-xs text-amber-700 block font-medium">Unanswered Questions</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {result.unanswered}
              </span>
            </div>
          </div>
        </div>

        {/* ================= DETAILED QUESTION REVIEW ================= */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Question Review & Detailed Explanations
              </h2>
              <p className="text-xs text-slate-500">
                Inspect your responses, identify misconceptions, and master underlying formulas
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("CORRECT")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "CORRECT" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Correct ({result.correct})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INCORRECT")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "INCORRECT" ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Incorrect ({result.incorrect})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("UNANSWERED")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "UNANSWERED" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Unanswered ({result.unanswered})
              </button>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No questions matched the selected filter criteria.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredQuestions.map((question) => {
                const index = question.originalIndex;
                const selectedAnswer = answers[index];
                const isAnswered = selectedAnswer !== undefined;
                const isCorrect = selectedAnswer === question.answer;

                return (
                  <div
                    key={index}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold mt-0.5">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                          {question.question}
                        </h3>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${
                        !isAnswered
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : isCorrect
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {!isAnswered ? "Unanswered" : isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    </div>

                    {/* Answers Comparison */}
                    <div className="ml-0 sm:ml-10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className={`p-3.5 rounded-xl border ${
                        !isAnswered
                          ? "bg-slate-50 border-slate-200 text-slate-500"
                          : isCorrect
                          ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          : "bg-rose-50/50 border-rose-200 text-rose-900"
                      }`}>
                        <span className="text-[11px] font-bold uppercase tracking-wider block mb-1 text-slate-400">
                          Your Selected Answer:
                        </span>
                        <p className="font-semibold">
                          {isAnswered
                            ? `${String.fromCharCode(65 + selectedAnswer)}. ${question.options[selectedAnswer]}`
                            : "None selected"}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border bg-emerald-50/40 border-emerald-200 text-emerald-950">
                        <span className="text-[11px] font-bold uppercase tracking-wider block mb-1 text-emerald-600">
                          Correct Answer:
                        </span>
                        <p className="font-semibold text-emerald-800">
                          {String.fromCharCode(65 + question.answer)}. {question.options[question.answer]}
                        </p>
                      </div>
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="ml-0 sm:ml-10 p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-700">
                        <span className="font-bold text-indigo-700 block mb-1 text-xs uppercase tracking-wider">
                          Explanation & Concept:
                        </span>
                        <p className="leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleRetake}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition hover:shadow-indigo-500/25 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Test
          </button>

          <button
            type="button"
            onClick={() => navigate("/practice-questions")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-xs shadow-xs transition"
          >
            Choose Another Topic
          </button>

          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Return to Dashboard
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default PracticeResults;