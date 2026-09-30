import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

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

  const result = useMemo(() => {
    const correct = questions.reduce((total, question, index) => {
      return total + (
        answers[index] === question.answer ? 1 : 0
      );
    }, 0);

    const answered = Object.keys(answers).length;
    const incorrect = answered - correct;
    const unanswered = totalQuestions - answered;
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

  if (!location.state) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-3">
              No Test Result Found
            </h1>

            <p className="text-slate-400 mb-6">
              Please complete a practice test first.
            </p>

            <button
              onClick={() => navigate("/practice-questions")}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
            >
              Go to Practice Questions
            </button>
          </div>
        </div>
      </>
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
    <>
      <Navbar />

      <div className="min-h-screen bg-slate-950 text-white px-6 py-10">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">
              Practice Test Completed
            </p>

            <h1 className="text-4xl font-bold mt-2">
              Your Results
            </h1>

            <p className="text-slate-400 mt-3">
              {section} • {difficulty}
            </p>
          </div>

          {/* Score */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center mb-8">
            <p className="text-slate-400 text-sm mb-2">
              Your Score
            </p>

            <div className="text-6xl font-bold">
              {score}
              <span className="text-2xl text-slate-500">
                {" "}/ {totalQuestions}
              </span>
            </div>

            <p className="text-indigo-400 text-2xl font-semibold mt-3">
              {result.percentage}%
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm">
                Correct
              </p>

              <p className="text-3xl font-bold text-green-400 mt-2">
                {result.correct}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm">
                Incorrect
              </p>

              <p className="text-3xl font-bold text-red-400 mt-2">
                {result.incorrect}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
              <p className="text-slate-400 text-sm">
                Unanswered
              </p>

              <p className="text-3xl font-bold text-yellow-400 mt-2">
                {result.unanswered}
              </p>
            </div>

          </div>

          {/* Question Review */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-5">
              Question Review
            </h2>

            <div className="space-y-5">

              {questions.map((question, index) => {

                const selectedAnswer = answers[index];
                const isAnswered = selectedAnswer !== undefined;
                const isCorrect =
                  selectedAnswer === question.answer;

                return (
                  <div
                    key={index}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
                  >

                    {/* Question */}
                    <div className="flex gap-3">
                      <span className="text-indigo-400 font-semibold">
                        Q{index + 1}.
                      </span>

                      <p className="font-medium leading-relaxed">
                        {question.question}
                      </p>
                    </div>

                    {/* Your Answer */}
                    <div className="mt-5">
                      <p className="text-sm text-slate-400 mb-1">
                        Your Answer
                      </p>

                      {isAnswered ? (
                        <p
                          className={
                            isCorrect
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {question.options[selectedAnswer]}
                        </p>
                      ) : (
                        <p className="text-yellow-400">
                          Not answered
                        </p>
                      )}
                    </div>

                    {/* Correct Answer */}
                    <div className="mt-4">
                      <p className="text-sm text-slate-400 mb-1">
                        Correct Answer
                      </p>

                      <p className="text-green-400">
                        {question.options[question.answer]}
                      </p>
                    </div>

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-5 pt-5 border-t border-slate-800">
                        <p className="text-sm text-slate-400 mb-1">
                          Explanation
                        </p>

                        <p className="text-slate-300 leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pb-10">

            <button
              onClick={handleRetake}
              className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition font-semibold"
            >
              Retake Test
            </button>

            <button
              onClick={() => navigate("/practice-questions")}
              className="px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition font-semibold"
            >
              Choose Another Test
            </button>

          </div>

        </div>
      </div>
    </>
  );
}

export default PracticeResults;