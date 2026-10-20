import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Briefcase, 
  Code, 
  CheckCircle2, 
  Clock, 
  Award, 
  ArrowRight, 
  TrendingUp,
  Sparkles,
  AlertCircle,
  Play,
  Calendar,
  Compass,
  ArrowUpRight,
  Brain,
  FileText,
  Trash2,
  Loader2
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";
import avatarImage from "../assets/avatar.png";
import { 
  formatTotalPracticeTime,
  formatCompletedInterviewsSubtext,
  formatCompactDuration 
} from "../utils/duration";

export default function Home() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.fullName?.split(" ")[0] || "Candidate";

  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
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
      console.warn("Failed to load overall performance for home summary:", err);
      setError("Unable to load performance metrics right now.");
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
      await fetchPerformanceData();
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

  // Safe metrics extraction
  const totalInterviews = performance?.totalInterviews ?? 0;
  const averageScore = performance?.averageScore ?? 0;
  const totalPracticeSeconds = totalInterviews > 0
    ? (performance?.totalPracticeSeconds ?? (performance?.totalPracticeMinutes ? performance.totalPracticeMinutes * 60 : 0))
    : 0;
  const recentInterviews = performance?.recentInterviews || [];

  // Chronological score data for Performance Snapshot Line Graph
  const chronologicalData = useMemo(() => {
    return [...recentInterviews]
      .reverse()
      .map((session, index) => {
        const d = session.completedAt || session.startedAt;
        const formattedDate = d
          ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" })
          : `Session ${index + 1}`;
        return {
          sessionNum: `#${index + 1}`,
          score: session.score,
          date: formattedDate,
          type: session.interviewType || "Technical",
          role: session.targetRole || "Software Engineer",
        };
      });
  }, [recentInterviews]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* A. HEADER / NAVBAR */}
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* ================= B. WELCOME SECTION ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 opacity-95" />
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-12">
            <div className="md:col-span-7 lg:col-span-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Interview Preparation
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Welcome back, <span className="text-indigo-400">{userName}</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Consistency is the foundation of interview excellence. Sharpen your communication, master technical deep-dives, and build real-world confidence through realistic simulations with Maya, your interactive AI coach.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/start-interview")}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98] hover:shadow-indigo-500/25"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Start an Interview
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/overall-performance")}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-medium text-sm transition-all"
                >
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  View Overall Performance
                </button>
              </div>
            </div>

            {/* Maya AI Coach Badge */}
            <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-end">
              <div className="relative">
                <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-3">
                  <img
                    src={avatarImage}
                    alt="Maya AI Coach"
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
                <div className="absolute -bottom-2 -left-2 bg-slate-800/90 backdrop-blur-md border border-slate-700 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="text-xs">
                    <p className="font-semibold text-white">Maya AI</p>
                    <p className="text-slate-400 text-[11px]">Voice & 3D Interactive Coach</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= C. STATISTICS CARDS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Preparation Statistics
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Live metrics calculated exclusively from your completed sessions
              </p>
            </div>
            <Link
              to="/overall-performance"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              Full Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {error && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 flex items-center gap-2.5 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              label="Completed Interviews"
              value={loading ? "..." : totalInterviews}
              subtext={totalInterviews > 0 ? "Evaluated mock sessions" : "No completed sessions"}
              icon={CheckCircle2}
              iconColor="text-indigo-600 bg-indigo-50"
            />
            <StatCard
              label="Average Interview Score"
              value={loading ? "..." : (totalInterviews > 0 ? `${averageScore}%` : "—")}
              subtext={totalInterviews > 0 ? (averageScore >= 75 ? "High competence band" : "Practice to reach 80%+") : "Awaiting first session"}
              icon={Award}
              iconColor="text-emerald-600 bg-emerald-50"
            />
            <StatCard
              label="Total Practice Time"
              value={loading ? "..." : (totalInterviews > 0 ? formatTotalPracticeTime(totalPracticeSeconds) : "0 min")}
              subtext={loading ? "..." : formatCompletedInterviewsSubtext(totalInterviews)}
              icon={Clock}
              iconColor="text-amber-600 bg-amber-50"
            />
          </div>
        </section>

        {/* ================= D. CHOOSE YOUR PRACTICE ================= */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Choose Your Practice
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select a specialized simulation track designed for target hiring rounds
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Technical Interview Card */}
            <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <Code className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                    Resume-Powered
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Technical Interview
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Programming, Frameworks & Architecture
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  Customized dynamically from your uploaded resume. Maya examines your actual projects, tests core CS fundamentals, evaluates design patterns, and probes problem-solving depth.
                </p>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Interview Focus:</p>
                  <p>3 Resume Projects • 6 Core Technical Questions</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/start-interview", { state: { interviewType: "Technical" } })}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-[0.99]"
                >
                  Start Technical Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* HR Interview Card */}
            <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Briefcase className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Behavioral & STAR
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    HR Interview
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Behavioral Scenarios & Culture Fit
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  Simulate HR and hiring manager behavioral rounds. Practice self-introductions, situational STAR responses, conflict resolution, leadership traits, and workplace communication.
                </p>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Interview Focus:</p>
                  <p>Introduction • Situational Behavioral • Q&A</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/start-interview", { state: { interviewType: "HR" } })}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all active:scale-[0.99]"
                >
                  Start HR Interview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Practice Questions Card */}
            <div className="group relative flex flex-col justify-between rounded-3xl bg-white border border-slate-200 p-8 shadow-xs hover:shadow-lg hover:border-violet-300 transition-all duration-200">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Brain className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                    Timed MCQs
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    Practice Questions
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Aptitude & Technical Assessments
                  </p>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  Hone placement test speed and accuracy with timed 30-question assessments across Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Core CS Fundamentals with immediate feedback.
                </p>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Practice Focus:</p>
                  <p>Quantitative • Logical • Verbal • Core CS</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/practice-questions")}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-xs transition-all active:scale-[0.99]"
                >
                  Start Practice Test
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= F. PERFORMANCE SNAPSHOT (LINE GRAPH) ================= */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Performance Snapshot
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Chronological score progression across completed interviews
              </p>
            </div>
            <Link
              to="/overall-performance"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View Overall Performance <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {chronologicalData.length >= 2 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chronologicalData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="sessionNum"
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tick={{ fontSize: 12, fill: "#64748B" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-md text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.sessionNum}: {data.type} Interview</p>
                            <p className="text-slate-500">{data.role} • {data.date}</p>
                            <p className="text-indigo-600 font-extrabold text-sm">Score: {data.score}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4F46E5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#4F46E5", strokeWidth: 2, stroke: "#FFFFFF" }}
                    activeDot={{ r: 6, fill: "#4338CA" }}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : chronologicalData.length === 1 ? (
            <div className="rounded-2xl bg-slate-50 border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Initial Baseline</p>
                <h4 className="text-lg font-bold text-slate-900 mt-0.5">
                  First Session Score: {chronologicalData[0].score}%
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  {chronologicalData[0].type} interview for {chronologicalData[0].role} on {chronologicalData[0].date}. Complete 2 or more sessions to plot your progression curve over time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/start-interview")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Take Second Session
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-700">No Historical Graph Points</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete mock interviews to generate genuine evaluation data. Scores will automatically plot your progress trajectory here.
              </p>
            </div>
          )}
        </section>

        {/* ================= E. RECENT COMPLETED INTERVIEWS ================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Recent Completed Interviews
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Latest 3–5 completed sessions with direct scorecard access
              </p>
            </div>
            {recentInterviews.length > 0 && (
              <Link
                to="/overall-performance"
                className="text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all in performance →
              </Link>
            )}
          </div>

          {recentInterviews.length > 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="divide-y divide-slate-100">
                {recentInterviews.slice(0, 5).map((session, idx) => {
                  const isHr = (session.interviewType || session.type || "").toUpperCase() === "HR";
                  const dateVal = session.completedAt || session.startedAt;
                  const formattedDate = dateVal
                    ? new Date(dateVal).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  const durationDisplay = formatCompactDuration(session.durationSeconds);

                  return (
                    <div
                      key={session.interviewId || session.id || idx}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          isHr ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                        }`}>
                          {isHr ? (
                            <Briefcase className="w-5 h-5" />
                          ) : (
                            <Code className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {isHr ? "HR" : "Technical"} Interview
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                              {session.difficulty || "Medium"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {session.targetRole || "Software Engineer"} • {formattedDate} {durationDisplay !== "—" && `• ${durationDisplay}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5">
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">Evaluation Score</span>
                          <span className={`text-sm font-black ${
                            session.score >= 75 ? "text-emerald-600" : session.score >= 50 ? "text-amber-600" : "text-rose-600"
                          }`}>
                            {session.score}%
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate("/interview-results", { state: { interviewId: session.interviewId } })}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition active:scale-[0.98]"
                          >
                            View Results
                          </button>
                          <button
                            type="button"
                            onClick={() => setSessionToDelete(session)}
                            title="Delete interview session"
                            aria-label={`Delete ${isHr ? "HR" : "Technical"} interview session`}
                            className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition active:scale-[0.95]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                No completed mock sessions yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Once you finish an interview with Maya, your full evaluated scorecard, question transcripts, and performance metrics will be logged here.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/start-interview")}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-xs transition"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Launch your first mock interview
                </button>
              </div>
            </div>
          )}
        </section>

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
                  {(sessionToDelete.interviewType || sessionToDelete.type || "Mock").toUpperCase()} interview
                </span>{" "}
                session for{" "}
                <span className="font-semibold text-slate-700">
                  {sessionToDelete.targetRole || "Software Engineer"}
                </span>{" "}
                and remove its question transcripts and evaluation scores. This action cannot be undone.
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

      {/* G. FOOTER */}
      <Footer />
    </div>
  );
}

function StatCard({ label, value, subtext, icon: Icon, iconColor }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <div className={`p-2 rounded-xl ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tight">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">
          {subtext}
        </p>
      </div>
    </div>
  );
}