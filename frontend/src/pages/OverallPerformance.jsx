import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Code,
  ArrowRight,
  Loader2,
  Layers,
  Sparkles,
  Target,
  Trash2
} from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import {
  formatPracticeHours,
  formatPracticeSubtext,
  formatCompactDuration,
} from "../utils/duration";

const OverallPerformance = () => {
  const navigate = useNavigate();

  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [barsAnimated, setBarsAnimated] = useState(false);

  useEffect(() => {
    fetchPerformance();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (performance) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setBarsAnimated(true);
        return;
      }
      setBarsAnimated(false);
      const timer = setTimeout(() => setBarsAnimated(true), 120);
      return () => clearTimeout(timer);
    }
  }, [performance]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        setError("Please sign in to view your interview performance.");
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/interviews/overall-performance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPerformance(response.data);
    } catch (err) {
      console.error("Failed to load overall performance:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your overall performance at this time."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      setIsDeleting(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setToastMessage({ type: "error", text: "Please sign in to delete sessions." });
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/interviews/${sessionToDelete.interviewId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setToastMessage({
        type: "success",
        text: "Interview session and evaluation records deleted successfully."
      });
      setSessionToDelete(null);
      await fetchPerformance();
    } catch (err) {
      console.error("Failed to delete interview:", err);
      setToastMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to delete interview session. Please try again."
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            Loading performance analytics...
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-2">Performance Analytics</h2>
            <p className="text-xs text-slate-500 mb-6">{error}</p>
            <button
              onClick={fetchPerformance}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const recentInterviews = performance?.recentInterviews || [];
  const readinessLevel = performance?.readinessLevel || "Interview Preparation";
  const typePerformance = performance?.performanceByInterviewType || {};
  const difficultyPerformance = performance?.performanceByDifficulty || {};

  const techScore = typePerformance["TECHNICAL"] ?? null;
  const hrScore = typePerformance["HR"] ?? null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <BarChart3 className="w-3.5 h-3.5" />
              Verified Performance Records
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Overall Performance Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Objective analytics calculated solely from completed interview sessions and rubric evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Readiness Status</span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                {readinessLevel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate("/start-interview")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-xs transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              New Interview
            </button>
          </div>
        </div>

        {/* Top KPI Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Interviews"
            value={performance.totalInterviews}
            subtext={performance.totalInterviews > 0 ? "Completed sessions" : "No completed sessions"}
            icon={Briefcase}
            color="text-indigo-600 bg-indigo-50"
          />
          <StatCard
            title="Average Score"
            value={performance.totalInterviews > 0 ? `${performance.averageScore}%` : "—"}
            subtext="Across all evaluated questions"
            icon={TrendingUp}
            color="text-emerald-600 bg-emerald-50"
          />
          <StatCard
            title="Best Score"
            value={performance.totalInterviews > 0 ? `${performance.bestScore}%` : "—"}
            subtext="Personal highest score"
            icon={Award}
            color="text-violet-600 bg-violet-50"
          />
          <StatCard
            title="Practice Time"
            value={formatPracticeHours(performance.totalPracticeSeconds ?? (performance.totalPracticeMinutes * 60))}
            subtext={formatPracticeSubtext(performance.totalPracticeSeconds ?? (performance.totalPracticeMinutes * 60))}
            icon={Clock}
            color="text-amber-600 bg-amber-50"
          />
        </div>

        {/* Track Comparison & Difficulty Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Track Performance (Technical vs HR) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Track Comparison: Technical vs. HR
                  </h3>
                  <p className="text-xs text-slate-500">
                    Average performance categorized by interview format
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Technical Track Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Code className="w-4 h-4 text-indigo-600" />
                    Technical Interviews
                  </span>
                  <span className="font-bold text-slate-900">
                    {techScore !== null ? `${techScore}%` : "No data"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: barsAnimated ? `${Math.min(Math.max(techScore || 0, 0), 100)}%` : "0%",
                      transition: "width 0.85s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  />
                </div>
              </div>

              {/* HR Track Bar */}
              <div>
                <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                  <span className="flex items-center gap-2 text-slate-700">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    HR & Behavioral Interviews
                  </span>
                  <span className="font-bold text-slate-900">
                    {hrScore !== null ? `${hrScore}%` : "No data"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: barsAnimated ? `${Math.min(Math.max(hrScore || 0, 0), 100)}%` : "0%",
                      transition: "width 0.85s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Performance is computed from questions answered during completed sessions.
            </p>
          </div>

          {/* Difficulty Level Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Performance by Difficulty Level
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluation depth across Easy, Medium, and Hard interviews
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["EASY", "MEDIUM", "HARD"].map((diff) => {
                const score = difficultyPerformance[diff];
                const hasScore = score !== undefined && score !== null;
                const badgeColor =
                  diff === "EASY"
                    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                    : diff === "MEDIUM"
                    ? "text-amber-700 bg-amber-50 border-amber-100"
                    : "text-rose-700 bg-rose-50 border-rose-100";

                return (
                  <div key={diff} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-center flex flex-col justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border mx-auto ${badgeColor}`}>
                      {diff}
                    </span>
                    <p className="text-xl font-extrabold text-slate-900 mt-2">
                      {hasScore ? `${score}%` : "—"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {hasScore ? "Recorded avg" : "Not attempted"}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Difficulty settings adjust question depth, system scale, and edge cases.
            </p>
          </div>
        </div>

        {/* Competency Performance Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Competency Rubric Assessment
              </h2>
              <p className="text-xs text-slate-500">
                Performance across Technical Depth, Communication, Project Knowledge, and Response Quality
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Rubric Analysis
            </span>
          </div>

          <PerformanceChart
            data={[
              { label: "Technical Knowledge", score: performance.technicalAverage },
              { label: "Communication", score: performance.communicationAverage },
              { label: "Project Knowledge", score: performance.projectAverage },
              { label: "Response Quality", score: performance.responseQualityAverage },
            ]}
          />
        </div>

        {/* Strengths + Areas to Improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Demonstrated Strengths
              </h2>
            </div>

            {performance.strengths?.length > 0 ? (
              <ul className="space-y-2.5">
                {performance.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 text-xs font-medium text-emerald-900"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 py-4 italic">
                Complete more interview questions to identify your strongest areas.
              </p>
            )}
          </div>

          {/* Areas to Improve */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Areas for Focus & Improvement
              </h2>
            </div>

            {performance.areasToImprove?.length > 0 ? (
              <ul className="space-y-2.5">
                {performance.areasToImprove.map((area, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/40 border border-amber-100 text-xs font-medium text-amber-900"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold mt-0.5">
                      •
                    </span>
                    <span className="leading-relaxed">{area}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 py-4 italic">
                {performance.totalInterviews > 0
                  ? "Great job! All core rubric dimensions are scoring at or above target levels."
                  : "Complete mock sessions to receive tailored improvement recommendations."}
              </p>
            )}
          </div>
        </div>

        {/* ================= COMPLETED INTERVIEWS HISTORY ================= */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Completed Interview History
              </h2>
              <p className="text-xs text-slate-500">
                Review scores, rubrics, candidate responses, and feedback from previous sessions
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {recentInterviews.length} Recorded
            </span>
          </div>

          {recentInterviews.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-3 pr-4">Type</th>
                    <th className="py-3 pr-4">Target Role</th>
                    <th className="py-3 pr-4">Difficulty</th>
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Duration</th>
                    <th className="py-3 pr-4">Score</th>
                    <th className="py-3 text-right">Scorecard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentInterviews.map((interview) => {
                    const isHr = (interview.interviewType || "").toUpperCase() === "HR";
                    const dateVal = interview.completedAt || interview.startedAt;
                    const formattedDate = dateVal
                      ? new Date(dateVal).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recent";

                    return (
                      <tr key={interview.interviewId} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 pr-4 font-semibold text-slate-900">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold text-[11px] ${
                            isHr ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                          }`}>
                            {isHr ? <Briefcase className="w-3 h-3" /> : <Code className="w-3 h-3" />}
                            {formatLabel(interview.interviewType)}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-slate-700 font-medium">
                          {interview.targetRole || "Software Engineer"}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500">
                          {formatLabel(interview.difficulty)}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-400">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 pr-4 text-slate-500 font-medium">
                          {formatCompactDuration(interview.durationSeconds)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className={`font-bold ${
                            interview.score >= 75
                              ? "text-emerald-600"
                              : interview.score >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}>
                            {interview.score}%
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate("/interview-results", {
                                  state: { interviewId: interview.interviewId },
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition"
                            >
                              View Scorecard
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setSessionToDelete(interview)}
                              title="Delete interview session"
                              aria-label={`Delete interview session ${interview.interviewId}`}
                              className="p-1.5 rounded-lg border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition active:scale-[0.95]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              No completed interviews recorded yet. Complete an interview to view scorecard records.
            </div>
          )}
        </div>

      </main>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Interview Session?
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                This will permanently delete your{" "}
                <span className="font-semibold text-slate-700">
                  {(sessionToDelete.interviewType || "Mock").toUpperCase()} interview
                </span>{" "}
                session for{" "}
                <span className="font-semibold text-slate-700">
                  {sessionToDelete.targetRole || "Software Engineer"}
                </span>{" "}
                and remove its scorecard analytics and question evaluations. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSessionToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Session"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-xs font-medium bg-white text-slate-900 border-slate-200">
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <Footer />
    </div>
  );
};

const PerformanceChart = ({ data }) => {
  const [chartAnimated, setChartAnimated] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setChartAnimated(true);
      return;
    }
    setChartAnimated(false);
    const timer = setTimeout(() => setChartAnimated(true), 100);
    return () => clearTimeout(timer);
  }, [data]);

  const chartWidth = 760;
  const chartHeight = 300;
  const chartLeft = 55;
  const chartBottom = 55;
  const chartTop = 20;
  const chartRight = 20;
  const plotWidth = chartWidth - chartLeft - chartRight;
  const plotHeight = chartHeight - chartTop - chartBottom;
  const barWidth = 72;
  const gap = (plotWidth - data.length * barWidth) / (data.length + 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[680px] h-[300px]" role="img" aria-label="Performance breakdown chart">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = chartTop + plotHeight - (value / 100) * plotHeight;
          return (
            <g key={value}>
              <line x1={chartLeft} x2={chartWidth - chartRight} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
              <text x={chartLeft - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#94a3b8">{value}%</text>
            </g>
          );
        })}
        {data.map(({ label, score }, index) => {
          const hasScore = score !== null && score !== undefined && Number(score) > 0;
          const safeScore = hasScore ? Math.min(Math.max(Number(score) || 0, 0), 100) : 0;
          const x = chartLeft + gap + index * (barWidth + gap);
          const targetBarHeight = (safeScore / 100) * plotHeight;
          const currentBarHeight = chartAnimated ? targetBarHeight : 0;
          const targetY = chartTop + plotHeight - targetBarHeight;
          const currentY = chartAnimated ? targetY : chartTop + plotHeight;
          return (
            <g key={label}>
              {hasScore ? (
                <>
                  <rect
                    x={x}
                    y={currentY}
                    width={barWidth}
                    height={currentBarHeight}
                    rx="8"
                    fill="#4f46e5"
                    style={{
                      transition: "y 0.8s cubic-bezier(0.16, 1, 0.3, 1), height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                      transitionDelay: `${index * 80}ms`,
                    }}
                  />
                  <text
                    x={x + barWidth / 2}
                    y={targetY - 8}
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="600"
                    fill="#1e293b"
                    style={{
                      opacity: chartAnimated ? 1 : 0,
                      transition: "opacity 0.4s ease-out",
                      transitionDelay: `${index * 80 + 350}ms`,
                    }}
                  >
                    {Number(score).toFixed(1)}%
                  </text>
                </>
              ) : (
                <text x={x + barWidth / 2} y={chartTop + plotHeight - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">No data</text>
              )}
              <text x={x + barWidth / 2} y={chartHeight - 30} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="500">
                {label.length > 18 ? (
                  <>
                    <tspan x={x + barWidth / 2} dy="0">{label.split(" ")[0]}</tspan>
                    <tspan x={x + barWidth / 2} dy="14">{label.split(" ").slice(1).join(" ")}</tspan>
                  </>
                ) : label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const StatCard = ({ title, value, subtext, icon: Icon, color }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div className={`p-2 rounded-xl ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          {subtext}
        </p>
      </div>
    </div>
  );
};

const formatLabel = (value) => {
  if (!value) return "Unknown";
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default OverallPerformance;