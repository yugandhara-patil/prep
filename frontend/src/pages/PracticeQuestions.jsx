import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  BrainCircuit,
  BookOpen,
  Terminal,
  FileText,
  Clock,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PracticeQuestions() {
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const practiceSections = [
    {
      title: "Quantitative Aptitude",
      icon: Calculator,
      badge: "Arithmetic & Math",
      description:
        "Test your numerical ability with percentages, ratios, averages, probability, time & work, equations, and algebra.",
    },
    {
      title: "Logical Reasoning",
      icon: BrainCircuit,
      badge: "Logic & Deduction",
      description:
        "Practice mixed analytical reasoning questions including number series, puzzles, coding-decoding, syllogisms, and patterns.",
    },
    {
      title: "Verbal Ability",
      icon: BookOpen,
      badge: "English & Comprehension",
      description:
        "Strengthen your linguistic proficiency through grammar rules, vocabulary, reading comprehension, idioms, and sentence correction.",
    },
    {
      title: "Technical Aptitude",
      icon: Terminal,
      badge: "Core CS & Engineering",
      description:
        "Assess your foundational technical aptitude in OOP concepts, DBMS & SQL, operating systems, data structures, and algorithms.",
    },
  ];

  const difficulties = [
    {
      title: "Easy",
      tag: "Fundamental",
      desc: "Foundational conceptual questions designed to build core intuition and accuracy.",
      color: "emerald",
    },
    {
      title: "Medium",
      tag: "Standard Placement",
      desc: "Standard industry placement-level questions with moderate complexity and multi-step reasoning.",
      color: "indigo",
    },
    {
      title: "Hard",
      tag: "Advanced Analytical",
      desc: "Challenging assessment questions requiring deep deduction, edge-case analysis, and rapid problem-solving.",
      color: "rose",
    },
  ];

  // =========================
  // DIFFICULTY SCREEN
  // =========================
  if (selectedSection) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* HEADER BANNER */}
          <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedSection(null);
                setSelectedDifficulty(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back to All Topics
            </button>

            <div className="mt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Step 2 of 2: Select Depth
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedSection}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Choose your difficulty level to begin a customized 30-question timed practice simulation.
              </p>
            </div>
          </section>

          {/* DIFFICULTY SELECTION CARDS */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Select Difficulty Level
              </h2>
              <p className="text-xs text-slate-500">
                Tailor question complexity according to your current preparation stage
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {difficulties.map((difficulty) => {
                const isSelected = selectedDifficulty === difficulty.title;

                return (
                  <button
                    key={difficulty.title}
                    type="button"
                    onClick={() => setSelectedDifficulty(difficulty.title)}
                    className={`rounded-3xl border p-6 text-left transition-all duration-200 flex flex-col justify-between hover:-translate-y-1 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          difficulty.title === "Easy"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : difficulty.title === "Medium"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {difficulty.tag}
                        </span>

                        <span className={`h-5 w-5 rounded-full flex items-center justify-center border text-xs ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white font-bold"
                            : "border-slate-300 text-transparent"
                        }`}>
                          ✓
                        </span>
                      </div>

                      <h3 className="mt-4 text-xl font-bold text-slate-900">
                        {difficulty.title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {difficulty.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? "text-indigo-600" : "text-slate-400"}>
                        {isSelected ? "Selected Tier" : "Click to select"}
                      </span>
                      <ChevronRight className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TEST CONFIGURATION BAR & START BUTTON */}
            {selectedDifficulty && (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs animate-fadeIn">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Configured Simulation
                    </span>

                    <h3 className="mt-1 text-xl font-bold text-slate-900">
                      {selectedSection} • {selectedDifficulty} Tier
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        30 Questions
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-indigo-600" />
                        30 Minutes (1 min / question)
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Target className="h-4 w-4 text-indigo-600" />
                        Mixed Multiple Choice
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/practice-test", {
                        state: {
                          section: selectedSection,
                          difficulty: selectedDifficulty,
                        },
                      })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-sm text-white shadow-md hover:bg-indigo-500 transition-all hover:shadow-indigo-500/25 active:scale-[0.99]"
                  >
                    Start Practice Test
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </section>

        </main>

        <Footer />
      </div>
    );
  }

  // =========================
  // SECTION SELECTION SCREEN
  // =========================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              Aptitude & Technical Drills
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Practice Questions
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600">
              Sharpen your placement problem-solving skills with timed practice assessments across quantitative, logical, verbal, and technical aptitude domains.
            </p>
          </div>
        </section>

        {/* SECTION SELECTION CARDS */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Choose a Subject Area
            </h2>
            <p className="text-xs text-slate-500">
              Each test delivers 30 timed multiple choice questions calibrated to your selected difficulty
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {practiceSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.title}
                  type="button"
                  onClick={() => setSelectedSection(section.title)}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 text-left transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {section.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {section.badge}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition">
                      30 Questions • Timed
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:gap-2 transition-all">
                      Configure & Start <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default PracticeQuestions;