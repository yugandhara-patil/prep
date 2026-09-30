import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

function PracticeQuestions() {
  const navigate = useNavigate();

  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const practiceSections = [
    {
      title: "Quantitative Aptitude",
      icon: "🧮",
      description:
        "Test your numerical ability with percentages, ratios, averages, probability, time and work, and more.",
    },
    {
      title: "Logical Reasoning",
      icon: "🧠",
      description:
        "Practice mixed reasoning questions including series, puzzles, coding-decoding, syllogisms, and more.",
    },
    {
      title: "Verbal Ability",
      icon: "📖",
      description:
        "Improve your language skills through grammar, vocabulary, comprehension, sentence correction, and more.",
    },
    {
      title: "Technical Aptitude",
      icon: "💻",
      description:
        "Test your technical knowledge with questions from programming, OOP, DBMS, SQL, OS, DSA, and more.",
    },
  ];

  const difficulties = [
    {
      title: "Easy",
      description: "Basic questions to build your fundamentals.",
    },
    {
      title: "Medium",
      description: "Standard placement-level questions.",
    },
    {
      title: "Hard",
      description: "Challenging questions that require deeper reasoning.",
    },
  ];

  // =========================
  // DIFFICULTY SCREEN
  // =========================

  if (selectedSection) {
    return (
      <div className="min-h-screen bg-[#F8F7FC]">
        <Navbar />

        <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 lg:px-10">

          {/* HEADER */}
          <section className="rounded-[28px] border border-purple-100 bg-gradient-to-br from-white via-[#FCFAFF] to-[#EEE8FF] px-7 py-10 shadow-[0_16px_50px_rgba(109,77,232,0.08)] md:px-11">

            <button
              type="button"
              onClick={() => {
                setSelectedSection(null);
                setSelectedDifficulty(null);
              }}
              className="text-sm font-semibold text-[#6D4DE8] transition hover:text-[#5E3FD1]"
            >
              ← Back to Sections
            </button>

            <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
              Practice Questions
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">
              {selectedSection}
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Choose your difficulty level to begin a 30-question practice
              test.
            </p>

          </section>

          {/* DIFFICULTY */}
          <section className="mt-10">

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-950">
                Choose Difficulty
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your test will contain 30 mixed questions.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.title}
                  type="button"
                  onClick={() =>
                    setSelectedDifficulty(difficulty.title)
                  }
                  className={`rounded-[24px] border bg-white p-7 text-left transition duration-200 hover:-translate-y-1 hover:shadow-lg ${
                    selectedDifficulty === difficulty.title
                      ? "border-[#6D4DE8] shadow-md ring-2 ring-[#6D4DE8]/20"
                      : "border-slate-200 hover:border-[#B9A8F2]"
                  }`}
                >

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${
                      difficulty.title === "Easy"
                        ? "bg-green-50 text-green-600"
                        : difficulty.title === "Medium"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {difficulty.title === "Easy"
                      ? "E"
                      : difficulty.title === "Medium"
                      ? "M"
                      : "H"}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-950">
                    {difficulty.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {difficulty.description}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-[#6D4DE8]">
                    {selectedDifficulty === difficulty.title
                      ? "Selected ✓"
                      : "Select Difficulty →"}
                  </p>

                </button>
              ))}

            </div>

            {/* TEST INFORMATION */}
            {selectedDifficulty && (
              <div className="mt-8 rounded-[24px] border border-purple-100 bg-white p-7 shadow-sm">

                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Test Configuration
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-slate-950">
                      {selectedSection} · {selectedDifficulty}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                      <span>📝 30 Questions</span>
                      <span>⏱️ 30 Minutes</span>
                      <span>🎯 Mixed Questions</span>
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
  className="rounded-xl bg-[#6D4DE8] px-7 py-3.5 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1]"
>
  Start Test
</button>

                </div>

              </div>
            )}

          </section>

        </main>
      </div>
    );
  }

  // =========================
  // SECTION SELECTION SCREEN
  // =========================

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 md:px-8 lg:px-10">

        {/* HEADER */}
        <section className="rounded-[28px] border border-purple-100 bg-gradient-to-br from-white via-[#FCFAFF] to-[#EEE8FF] px-7 py-10 shadow-[0_16px_50px_rgba(109,77,232,0.08)] md:px-11">

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
            Aptitude Preparation
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">
            Practice Questions
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Sharpen your aptitude and placement skills with timed practice
            tests across quantitative, logical, verbal, and technical areas.
          </p>

        </section>

        {/* SECTION SELECTION */}
        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Choose a Section
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Each test contains 30 mixed questions based on your selected
              difficulty.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            {practiceSections.map((section) => (
              <button
                key={section.title}
                type="button"
                onClick={() => setSelectedSection(section.title)}
                className="group rounded-[24px] border border-slate-200 bg-white p-7 text-left transition duration-200 hover:-translate-y-1 hover:border-[#B9A8F2] hover:shadow-lg"
              >

                <div className="flex items-start gap-5">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F1EDFF] text-3xl">
                    {section.icon}
                  </div>

                  <div className="flex-1">

                    <h3 className="text-xl font-bold text-slate-950">
                      {section.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {section.description}
                    </p>

                    <p className="mt-5 text-sm font-semibold text-[#6D4DE8]">
                      Select Section →
                    </p>

                  </div>

                </div>

              </button>
            ))}

          </div>

        </section>

      </main>
    </div>
  );
}

export default PracticeQuestions;