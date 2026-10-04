import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function InterviewResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        setResults({
          ...backend,
          interviewId: backend.interviewId ?? interviewId,
      timeSeconds:
  Number(backend.timeSeconds) > 0
    ? Number(backend.timeSeconds)
    : Number(stored?.timeSeconds || 0) > 0
      ? Number(stored.timeSeconds)
      : Number(
          sessionStorage.getItem("interviewTimeSeconds") || 0
        ),
        });
      }
    } catch (requestError) {
      console.error(
        "Failed to load interview results:",
        requestError
      );

      // If backend results cannot be loaded, show the saved
      // interview evaluation instead.
      if (!cancelled && stored) {
        setResults({
          ...stored,
          interviewId: stored.interviewId ?? interviewId,
        });

        setError(
          "Showing the saved interview evaluation because the results service could not be reached."
        );
      } else if (!cancelled) {
        setError("Unable to load the interview results.");
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="font-medium text-slate-600">
          Loading your interview results...
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-red-600">
            {error || "Interview results not found"}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/start-interview")}
            className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 font-semibold text-white"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const correct =
    results.correctAnswers ??
    answers.filter((x) => x.evaluation === "CORRECT").length;

  const partial =
    results.partiallyCorrectAnswers ??
    answers.filter((x) => x.evaluation === "PARTIALLY_CORRECT").length;

  const incorrect =
    results.incorrectAnswers ??
    answers.filter((x) => x.evaluation === "INCORRECT").length;

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

  const minutes = Math.floor(Number(results.timeSeconds || 0) / 60);
  const seconds = Number(results.timeSeconds || 0) % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  const metric = (value) =>
    value === null || value === undefined ? "—" : `${value}%`;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <main className="mx-auto max-w-6xl">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <p className="mt-5 text-sm font-semibold text-purple-600">
              Interview Completed
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">
              Your Interview Performance
            </h1>
            <p className="mt-2 text-slate-500">
              {results.targetRole || "Interview"} ·{" "}
              {results.interviewType || "Interview"}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          <div className="mt-10 grid gap-4 md:grid-cols-4">
            <ResultCard label="Interview Time" value={formattedTime} />
            <ResultCard
              label="Overall Performance"
              value={`${overallScore}%`}
            />
            <ResultCard label="Questions Answered" value={answers.length} />
            <ResultCard
              label="Difficulty"
              value={(results.difficulty || "-").toLowerCase()}
              capitalize
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <ResultCard
              label="Communication"
              value={metric(results.communicationScore)}
            />
            <ResultCard
              label="Technical Knowledge"
              value={metric(results.technicalKnowledgeScore)}
            />
            <ResultCard
              label="Project Knowledge"
              value={metric(results.projectKnowledgeScore)}
            />
            <ResultCard
              label="Response Quality"
              value={metric(results.responseQualityScore)}
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <ResultCard label="Correct" value={correct} />
            <ResultCard label="Partially Correct" value={partial} />
            <ResultCard label="Incorrect" value={incorrect} />
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold text-slate-900">
              Question Performance
            </h2>

            {answers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 p-5 text-sm text-slate-500">
                No evaluated answers were recorded for this interview.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {answers.map((item, index) => (
                  <div
                    key={`${index}-${item.question}`}
                    className="rounded-2xl border border-slate-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold text-slate-900">
                        {index + 1}. {item.question}
                      </p>
                      <span className="shrink-0 text-xs font-bold uppercase text-slate-500">
                        {String(item.evaluation || "").replaceAll("_", " ")}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      <strong>Your answer:</strong>{" "}
                      {item.answer || "No answer recorded."}
                    </p>

                    {item.feedback && (
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        <strong>Maya:</strong> {item.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("interviewResults");
                sessionStorage.removeItem("interviewResultsInterviewId");
                sessionStorage.removeItem("interviewTimeSeconds");
                navigate("/start-interview");
              }}
              className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-purple-700"
            >
              Start New Interview
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ResultCard({ label, value, capitalize = false }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 text-center">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold text-slate-950 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default InterviewResults;
