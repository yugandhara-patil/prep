import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

import femaleAvatar from "../assets/final women avtar.mp4";

function Interview() {
  const navigate = useNavigate();

  const [setup, setSetup] = useState(null);
  const [interviewer, setInterviewer] = useState(null);

  const [interviewStatus, setInterviewStatus] =
    useState("speaking");

  const [isMicOn, setIsMicOn] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  // TEMPORARY QUESTION
  // Later this will come from AI/backend
  const [currentQuestion] = useState(
    "Tell me about yourself and walk me through your background."
  );

  // =========================
  // LOAD INTERVIEW DATA
  // =========================
  useEffect(() => {
    const storedSetup =
      sessionStorage.getItem("interviewSetup");

    if (!storedSetup) {
      navigate("/start-interview");
      return;
    }

    setSetup(JSON.parse(storedSetup));

    const storedInterviewer =
      sessionStorage.getItem(
        "selectedInterviewer"
      );

    if (storedInterviewer) {
      setInterviewer(
        JSON.parse(storedInterviewer)
      );
    }
  }, [navigate]);

  // =========================
  // TIMER
  // =========================
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function formatTime(totalSeconds) {
    const minutes = Math.floor(
      totalSeconds / 60
    );

    const remainingSeconds =
      totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  // =========================
  // MICROPHONE
  // =========================
  function handleMicrophone() {
    if (isMicOn) {
      setIsMicOn(false);
      setInterviewStatus("processing");

      /*
        Later:

        1. Stop Speech Recognition
        2. Get transcript
        3. Send answer to backend
        4. AI analyzes answer
        5. Generate next question
        6. Avatar speaks next question
      */

      setTimeout(() => {
        setInterviewStatus("speaking");
      }, 1500);

      return;
    }

    setIsMicOn(true);
    setInterviewStatus("listening");
  }

  // =========================
  // END INTERVIEW
  // =========================
  function handleEndInterview() {
    const confirmEnd =
      window.confirm(
        "Are you sure you want to end this interview?"
      );

    if (!confirmEnd) return;

    navigate("/home");
  }

  if (!setup) {
    return (
      <div className="min-h-screen bg-[#F8F7FC]">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <p className="font-medium text-slate-500">
            Preparing your interview...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-10 pt-6 md:px-8 lg:px-10">

        {/* ================= TOP BAR ================= */}
        <section className="mb-5 flex flex-col gap-4 rounded-[18px] border border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="text-sm font-medium text-slate-500">
              Live Interview
            </p>

            <h1 className="mt-1 text-xl font-bold text-slate-950">
              {setup.interviewType} Interview
            </h1>

          </div>


          <div className="flex flex-wrap items-center gap-2 text-sm">

            <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
              {setup.targetRole}
            </span>

            <span className="rounded-lg bg-[#F0EBFF] px-3 py-1.5 font-semibold text-[#6D4DE8]">
              {setup.difficulty}
            </span>

            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700">
              {formatTime(seconds)}
            </span>

          </div>

        </section>


        {/* ================= LIVE INTERVIEW ================= */}
        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">

          <div className="grid min-h-[650px] lg:grid-cols-[1.15fr_0.85fr]">


            {/* ================= AVATAR SIDE ================= */}
            <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-[#F3F0F8] p-6">

              <div className="absolute left-6 top-6 z-20">

                <p className="text-sm font-medium text-slate-500">
                  Your Interviewer
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {interviewer?.name || "Maya"}
                </h2>

              </div>


              {/* AVATAR VIDEO */}
              <div className="relative w-full max-w-[540px] overflow-hidden rounded-[24px] bg-white shadow-lg">

                <video
                  src={femaleAvatar}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="aspect-square h-full w-full object-cover"
                />

                {/* STATUS OVERLAY */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">

                  <StatusBadge
                    status={interviewStatus}
                  />

                </div>

              </div>

            </div>


            {/* ================= CONVERSATION SIDE ================= */}
            <div className="flex flex-col p-6 md:p-8">

              <div>

                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8A78C8]">
                  Interview Question
                </p>

                <h2 className="mt-4 text-2xl font-bold leading-9 text-slate-950 md:text-3xl">
                  {currentQuestion}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Listen to the interviewer and answer naturally using your microphone.
                </p>

              </div>


              {/* INTERVIEW STATUS */}
              <div className="mt-10 rounded-[18px] border border-slate-200 bg-[#FAFAFC] p-5">

                {interviewStatus ===
                  "speaking" && (
                  <>
                    <p className="font-semibold text-slate-900">
                      Interviewer is speaking
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Listen carefully to the question.
                    </p>
                  </>
                )}

                {interviewStatus ===
                  "listening" && (
                  <>
                    <p className="font-semibold text-[#6D4DE8]">
                      Listening to your answer
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Speak naturally. Your response will be processed automatically.
                    </p>
                  </>
                )}

                {interviewStatus ===
                  "processing" && (
                  <>
                    <p className="font-semibold text-slate-900">
                      Processing your answer
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Preparing the next interview question.
                    </p>
                  </>
                )}

              </div>


              {/* MICROPHONE */}
              <div className="flex flex-1 items-center justify-center py-12">

                <div className="text-center">

                  <button
                    type="button"
                    onClick={handleMicrophone}
                    disabled={
                      interviewStatus ===
                      "processing"
                    }
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg transition ${
                      isMicOn
                        ? "bg-red-500 shadow-red-200 hover:bg-red-600"
                        : "bg-[#6D4DE8] shadow-purple-200 hover:bg-[#5E3FD1]"
                    } disabled:cursor-not-allowed disabled:bg-slate-300`}
                  >
                    {isMicOn ? "Stop" : "Mic"}
                  </button>

                  <p className="mt-4 font-semibold text-slate-800">

                    {isMicOn
                      ? "Tap when you finish speaking"
                      : "Tap to answer"}

                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Voice input
                  </p>

                </div>

              </div>


              {/* END INTERVIEW */}
              <div className="border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={
                    handleEndInterview
                  }
                  className="w-full rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 transition hover:bg-red-50"
                >
                  End Interview
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}


/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  let text = "Interviewer Speaking";

  if (status === "listening") {
    text = "Listening";
  }

  if (status === "processing") {
    text = "Processing";
  }

  return (
    <div className="rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-800 shadow-md backdrop-blur">
      {text}
    </div>
  );
}

export default Interview;