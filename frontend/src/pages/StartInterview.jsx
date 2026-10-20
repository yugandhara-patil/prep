import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Code, 
  Briefcase, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Check,
  ShieldCheck,
  Mic,
  Compass,
  FileText,
  Play,
  X
} from "lucide-react";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StartInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  const preselectedType = location.state?.interviewType || "Technical";

  const [interviewType, setInterviewType] = useState(preselectedType);
  const [difficulty, setDifficulty] = useState(interviewType === "Technical" ? "Medium" : "");
  const [targetRole, setTargetRole] = useState("");
  const [technicalFocus, setTechnicalFocus] = useState("");
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const roleSuggestions = [
    "Full Stack Developer",
    "Java Backend Engineer",
    "Frontend React Engineer",
    "Python Developer",
    "Data Scientist",
    "DevOps Engineer",
  ];

  function handleTypeSelect(type) {
    setInterviewType(type);
    setMessage("");
    if (type === "HR") {
      setDifficulty(""); // HR has strictly no difficulty selection
    } else if (!difficulty) {
      setDifficulty("Medium");
    }
  }

  function handleResumeChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResume(null);
      setMessage("Please upload a valid PDF (.pdf) or Word (.docx) document.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);
      setMessage("Resume file size must be less than 5 MB.");
      return;
    }

    setResume(file);
    setMessage("");
  }

  async function handleStartInterview(e) {
    e.preventDefault();
    setMessage("");

    if (!interviewType) {
      setMessage("Please select an interview track.");
      return;
    }

    if (!targetRole.trim()) {
      setMessage("Please specify your target job role.");
      return;
    }

    // Difficulty is required ONLY for Technical interview
    if (interviewType === "Technical" && !difficulty) {
      setMessage("Please select a difficulty level for the technical interview.");
      return;
    }

    if (!resume) {
      setMessage("Please upload your resume to enable personalized question generation.");
      return;
    }

    try {
      setLoading(true);

      const interviewData = {
        interviewType,
        targetRole: targetRole.trim(),
        difficulty: interviewType === "Technical" ? difficulty : "Medium",
        technicalFocus: interviewType === "Technical" ? technicalFocus.trim() : "",
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(interviewData)], {
          type: "application/json",
        })
      );
      formData.append("resume", resume);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/interviews/start`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdInterview = response.data;

      // Preserve exact session storage payload expected by protected live Interview.jsx
      sessionStorage.setItem(
        "interviewSetup",
        JSON.stringify({
          interviewId: createdInterview.interviewId,
          interviewType: createdInterview.interviewType,
          difficulty: createdInterview.difficulty,
          targetRole: createdInterview.targetRole,
          technicalFocus: createdInterview.technicalFocus,
          resumeName: createdInterview.resumeFileName,
          firstQuestion: createdInterview.firstQuestion,
        })
      );

      navigate("/interview");
    } catch (error) {
      console.error("Start interview error:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setMessage("Your login session has expired. Please log in again.");
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to generate interview session. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Simulation Setup
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Configure Your Mock Interview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your track, enter your target role, and attach your resume. Maya will tailor every question to your background.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <Mic className="w-3.5 h-3.5 text-indigo-600" />
              Voice-Enabled 3D Coach
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {message && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs font-medium text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Container: Balanced 2-Column Desktop Grid */}
        <form onSubmit={handleStartInterview}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / MAIN COLUMN (7 cols): Configuration Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Track Selector */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <label className="text-sm font-bold text-slate-900">
                    1. Select Interview Track
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">Required</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleTypeSelect("Technical")}
                    className={`p-4 rounded-xl border text-left transition relative flex items-start gap-3.5 ${
                      interviewType === "Technical"
                        ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${interviewType === "Technical" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Code className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">Technical Interview</h3>
                        {interviewType === "Technical" && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Projects deep dive, system architecture, core engineering concepts, and problem-solving.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTypeSelect("HR")}
                    className={`p-4 rounded-xl border text-left transition relative flex items-start gap-3.5 ${
                      interviewType === "HR"
                        ? "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${interviewType === "HR" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">HR Interview</h3>
                        {interviewType === "HR" && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Conversational HR dialogue: self-intro, motivations, strengths, STAR scenarios, and culture fit.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Target Job Role & Focus */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <label className="text-sm font-bold text-slate-900">
                    2. Target Job Role & Specialization
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">Required</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    required
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer, Java Developer, Data Scientist"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                  />

                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <span className="text-[11px] text-slate-400 self-center mr-1">Suggestions:</span>
                    {roleSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setTargetRole(suggestion)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200 transition"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                {interviewType === "Technical" && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Technical Focus / Preferred Topics <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={technicalFocus}
                      onChange={(e) => setTechnicalFocus(e.target.value)}
                      placeholder="e.g. Spring Boot, REST APIs, Microservices, MySQL, System Design"
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Helps Maya prioritize specific technologies mentioned in your resume.
                    </p>
                  </div>
                )}
              </div>

              {/* 3. Difficulty Level (Technical Only) */}
              {interviewType === "Technical" && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <label className="text-sm font-bold text-slate-900">
                      3. Technical Question Depth & Difficulty
                    </label>
                    <span className="text-[11px] font-semibold text-slate-400">Required</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        level: "Easy",
                        badge: "Fundamentals",
                        desc: "Definitions, core syntax, purpose, and standard usage.",
                      },
                      {
                        level: "Medium",
                        badge: "Standard Placement",
                        desc: "Practical application, comparisons, debugging, and trade-offs.",
                      },
                      {
                        level: "Hard",
                        badge: "Advanced & Scalability",
                        desc: "Edge cases, performance optimizations, and architectural depth.",
                      },
                    ].map((item) => (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setDifficulty(item.level)}
                        className={`p-4 rounded-xl border text-left transition flex flex-col justify-between ${
                          difficulty === item.level
                            ? "border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-bold text-slate-900">{item.level}</span>
                            {difficulty === item.level && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 mt-3 block">{item.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT / SIDEBAR COLUMN (5 cols): Resume Upload & Launch Card */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Resume Upload Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <label className="text-sm font-bold text-slate-900">
                    Candidate Resume Document
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">PDF or DOCX</span>
                </div>

                {!resume ? (
                  <label
                    htmlFor="resume-upload"
                    className="group border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 transition"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 group-hover:border-indigo-300 group-hover:bg-indigo-50 flex items-center justify-center text-slate-600 group-hover:text-indigo-600 transition mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                      Click to upload your resume
                    </span>
                    <span className="text-xs text-slate-500 mt-1">
                      PDF or DOCX format (Max size: 5 MB)
                    </span>
                    <span className="mt-3 inline-block px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-semibold group-hover:border-indigo-200 group-hover:text-indigo-600 transition">
                      Browse Files
                    </span>
                    <input
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 truncate">{resume.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {(resume.size / 1024 / 1024).toFixed(2)} MB • Ready for analysis
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setResume(null)}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-rose-600 transition shrink-0"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Resume data is parsed privately in-session for interview personalization.</span>
                </div>
              </div>

              {/* Session Structure Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Simulation Protocol
                </h4>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Greeting & wellbeing readiness verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Candidate self-introduction & background</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Strict 3 Project + 6 Core Technical questions sequence</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Candidate Q&A period followed by formal closing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>Comprehensive rubric scorecard upon completion</span>
                  </li>
                </ul>
              </div>

              {/* Primary Action Button */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Resume & Initializing Maya...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      Launch Mock Interview Session
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Ensure your microphone is connected and quiet surroundings are available.
                </p>
              </div>

            </div>

          </div>
        </form>

      </main>

      <Footer />
    </div>
  );
}