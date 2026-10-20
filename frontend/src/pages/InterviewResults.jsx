import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  BarChart3, 
  TrendingUp, 
  MessageSquareQuote, 
  Loader2,
  Calendar,
  Layers,
  ChevronLeft,
  Filter,
  Check,
  XCircle,
  HelpCircle
} from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { formatSessionDuration } from "../utils/duration";

export default function InterviewResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, CORRECT, PARTIAL, INCORRECT

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      const storedRaw = sessionStorage.getItem("interviewResults");
      const stored = storedRaw ? JSON.parse(storedRaw) : null;

      const interviewId =
        location.state?.interviewId ||
        stored?.interviewId ||
        sessionStorage.getItem("interviewResultsInterviewId");

      if (!interviewId) {
        setError("Interview ID not found.");
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/interviews/${interviewId}/results`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          const backend = response.data || {};
          const parsedTime = Number(backend.timeSeconds) > 0
            ? Number(backend.timeSeconds)
            : Number(stored?.timeSeconds || 0) > 0
            ? Number(stored.timeSeconds)
            : Number(sessionStorage.getItem("interviewTimeSeconds") || 0);

          setResults({
            ...backend,
            interviewId: backend.interviewId ?? interviewId,
            timeSeconds: isNaN(parsedTime) ? 0 : parsedTime,
          });
        }
      } catch (requestError) {
        console.error("Failed to load interview results:", requestError);
        if (!cancelled && stored) {
          setResults({
            ...stored,
            interviewId: stored.interviewId ?? interviewId,
            timeSeconds: Number(stored.timeSeconds) || Number(sessionStorage.getItem("interviewTimeSeconds")) || 0,
          });
          setError("Showing saved local evaluation (results service could not be reached).");
        } else if (!cancelled) {
          setError("Unable to retrieve interview scorecard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [location.state]);

  const answers = useMemo(
    () =>
      (results?.answers ||
        results?.answerResults ||
        results?.evaluations ||
        []
      ).filter(
        (item) =>
          item.stage !== "CLOSING" &&
          ["CORRECT", "PARTIALLY_CORRECT", "INCORRECT"].includes(
            String(item.evaluation || "").toUpperCase()
          )
      ),
    [results]
  );

  const filteredAnswers = useMemo(() => {
    if (filterType === "ALL") return answers;
    return answers.filter((item) => String(item.evaluation || "").toUpperCase() === filterType);
  }, [answers, filterType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 font-medium text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Analyzing your interview scorecard...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900">
              {error || "Interview Session Not Found"}
            </h2>
            <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
              We couldn't retrieve the session data. You can return to the dashboard or launch a fresh mock interview.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/home"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Return to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => navigate("/start-interview")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const correct =
    results.correctAnswers ??
    answers.filter((x) => String(x.evaluation || "").toUpperCase() === "CORRECT").length;

  const partial =
    results.partiallyCorrectAnswers ??
    answers.filter((x) => String(x.evaluation || "").toUpperCase() === "PARTIALLY_CORRECT").length;

  const incorrect =
    results.incorrectAnswers ??
    answers.filter((x) => String(x.evaluation || "").toUpperCase() === "INCORRECT").length;

  const overallScore =
    results.overallScore ??
    (answers.length
      ? Math.round(
          answers.reduce((sum, item) => {
            if (item.evaluation === "CORRECT") return sum + 100;
            if (item.evaluation === "PARTIALLY_CORRECT") return sum + 60;
            return sum;
          }, 0) / answers.length
        )
      : 0);

  const totalSec = Math.max(0, Number(results.timeSeconds) || 0);
  const formattedDuration = formatSessionDuration(totalSec);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-2">
          <Link
            to="/overall-performance"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Overall Performance
          </Link>

          <span className="text-xs text-slate-400 font-medium">
            Session ID #{results.interviewId || "N/A"}
          </span>
        </div>

        {/* ================= HERO SUMMARY BANNER ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-50/70 pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left 8 Cols: Session Info */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Interview Completed
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  {results.interviewType || "Technical"} Track
                </span>

                {results.difficulty && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                    {results.difficulty} Difficulty
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Performance Scorecard
                </h1>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Target Role: <strong className="text-slate-800">{results.targetRole || "Software Engineer"}</strong>
                  {results.technicalFocus && ` • Focus Area: ${results.technicalFocus}`}
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Score Card */}
            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <div className="w-full sm:w-auto min-w-[220px] p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 text-center shadow-xs">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Overall Score
                </span>
                <span className={`text-5xl font-black tracking-tight ${
                  overallScore >= 75 ? "text-emerald-600" : overallScore >= 50 ? "text-amber-600" : "text-rose-600"
                }`}>
                  {overallScore}%
                </span>
                <div className="mt-2.5">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    overallScore >= 75
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : overallScore >= 50
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}>
                    {overallScore >= 75 ? "Ready for Industry Rounds" : overallScore >= 50 ? "Satisfactory Foundation" : "Further Practice Needed"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Metrics Bar (Full Width Responsive Grid) */}
          <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block font-medium">Session Duration</span>
              <span className="text-lg font-black text-slate-900 mt-1 block font-mono">
                {formattedDuration}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-center">
              <span className="text-xs text-slate-400 block font-medium">Questions Evaluated</span>
              <span className="text-lg font-black text-slate-900 mt-1 block">
                {answers.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <span className="text-xs text-emerald-700 block font-medium">Correct Responses</span>
              <span className="text-lg font-black text-emerald-700 mt-1 block">
                {correct}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <span className="text-xs text-amber-700 block font-medium">Partial / Needs Work</span>
              <span className="text-lg font-black text-amber-700 mt-1 block">
                {partial + incorrect}
              </span>
            </div>
          </div>
        </div>

        {/* ================= COMPETENCY RUBRIC ASSESSMENT ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Competency Rubric Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Objective evaluation across core professional dimensions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RubricCard
              title="Communication"
              score={results.communicationScore}
              desc="Clarity, structure, STAR methodology, and concise professional articulation"
            />
            <RubricCard
              title="Technical Depth"
              score={results.technicalKnowledgeScore}
              desc="Syntax correctness, algorithmic depth, and core computer science fundamentals"
            />
            <RubricCard
              title="Project Knowledge"
              score={results.projectKnowledgeScore}
              desc="System design, architecture trade-offs, database choices, and implementation details"
            />
            <RubricCard
              title="Response Quality"
              score={results.responseQualityScore}
              desc="Completeness of reasoning, edge-case consideration, and situational insight"
            />
          </div>
        </div>

        {/* ================= DETAILED QUESTION REVIEW LIST ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Question-by-Question Transcript & Feedback
                </h2>
                <p className="text-xs text-slate-500">
                  Review your spoken answers alongside Maya's detailed analytical feedback
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All ({answers.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("CORRECT")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "CORRECT" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Correct ({correct})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("PARTIALLY_CORRECT")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "PARTIALLY_CORRECT" ? "bg-white text-amber-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Partial ({partial})
              </button>
              <button
                type="button"
                onClick={() => setFilterType("INCORRECT")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterType === "INCORRECT" ? "bg-white text-rose-700 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Incorrect ({incorrect})
              </button>
            </div>
          </div>

          {filteredAnswers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              No questions matched the selected filter criteria.
            </div>
          ) : (
            <div className="space-y-5">
              {filteredAnswers.map((item, index) => {
                const evalType = String(item.evaluation || "").toUpperCase();
                const isCorrect = evalType === "CORRECT";
                const isPartial = evalType === "PARTIALLY_CORRECT";

                const badgeBg = isCorrect
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : isPartial
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200";

                return (
                  <div
                    key={`${index}-${item.question}`}
                    className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold mt-0.5 shadow-xs">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                            {item.question}
                          </h3>
                          {item.stage && (
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                              Stage: {item.stage}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border shrink-0 ${badgeBg}`}>
                        {isCorrect ? <Check className="w-3.5 h-3.5" /> : isPartial ? <HelpCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {evalType.replace("_", " ")}
                      </span>
                    </div>

                    {/* Candidate Spoken Response Box */}
                    <div className="ml-0 sm:ml-10 space-y-3">
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800">
                        <span className="font-bold text-slate-900 block mb-1.5 text-xs uppercase tracking-wider text-slate-400">
                          Your Spoken Response:
                        </span>
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {item.answer || <span className="text-slate-400 italic">No audible answer recorded.</span>}
                        </p>
                      </div>

                      {/* Maya's Feedback Box */}
                      {item.feedback && (
                        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-indigo-950">
                          <span className="font-bold text-indigo-700 block mb-1.5 text-xs uppercase tracking-wider">
                            Maya AI Feedback & Rubric Notes:
                          </span>
                          <p className="leading-relaxed">
                            {item.feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ================= ACTION CONTROLS ================= */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/overall-performance"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Back to Performance
          </Link>

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem("interviewResults");
              sessionStorage.removeItem("interviewResultsInterviewId");
              sessionStorage.removeItem("interviewTimeSeconds");
              navigate("/start-interview");
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition hover:shadow-indigo-500/25 active:scale-[0.99]"
          >
            <RotateCcw className="w-4 h-4" />
            Start Another Interview
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}

function RubricCard({ title, score, desc }) {
  const numScore = Number(score);
  const isValid = !isNaN(numScore) && score !== null && score !== undefined;
  const displayScore = isValid ? `${Math.round(numScore)}%` : "—";
  const percentage = isValid ? Math.min(100, Math.max(0, numScore)) : 0;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:border-slate-300 transition-all">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
          <span className={`text-base font-extrabold ${
            isValid
              ? numScore >= 75
                ? "text-emerald-600"
                : numScore >= 50
                ? "text-amber-600"
                : "text-rose-600"
              : "text-slate-400"
          }`}>
            {displayScore}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
      </div>

      <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${
            numScore >= 75
              ? "bg-emerald-500"
              : numScore >= 50
              ? "bg-amber-500"
              : "bg-rose-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
