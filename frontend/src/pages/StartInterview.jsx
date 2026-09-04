import { useState } from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import axios from "axios";
import Navbar from "./Navbar";

function StartInterview() {
  const navigate = useNavigate();
  const location = useLocation();

  // Interview selected from Home
  const preselectedType =
    location.state?.interviewType || "";

  const [interviewType, setInterviewType] =
    useState(preselectedType);

  const [difficulty, setDifficulty] =
    useState("");

  const [targetRole, setTargetRole] =
    useState("");

  const [technicalFocus, setTechnicalFocus] =
    useState("");

  const [resume, setResume] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // RESUME
  // =========================
  function handleResumeChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setResume(null);

      setMessage(
        "Please upload a PDF or DOCX resume."
      );

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResume(null);

      setMessage(
        "Resume file must be smaller than 5 MB."
      );

      return;
    }

    setResume(file);
    setMessage("");
  }

  // =========================
  // START INTERVIEW
  // =========================
  async function handleStartInterview() {
    setMessage("");
    setLoading(true);

    if (!interviewType) {
      setMessage(
        "Please select an interview type."
      );
      setLoading(false);
      return;
    }

    if (!targetRole.trim()) {
      setMessage(
        "Please enter your target role."
      );
      setLoading(false);
      return;
    }

    if (!difficulty) {
      setMessage(
        "Please select a difficulty level."
      );
      setLoading(false);
      return;
    }

    if (!resume) {
      setMessage(
        "Please upload your resume."
      );
      setLoading(false);
      return;
    }

    try {
      // =========================
      // PREPARE FORM DATA
      // =========================
      const interviewData = {
  interviewType,
  targetRole: targetRole.trim(),
  difficulty,

  technicalFocus:
    interviewType === "Technical"
      ? technicalFocus.trim()
      : "",
};

const formData = new FormData();

formData.append(
  "data",
  new Blob(
    [JSON.stringify(interviewData)],
    {
      type: "application/json",
    }
  )
);

formData.append(
  "resume",
  resume
);

      // Get token from localStorage or your auth context
      const token = localStorage.getItem("token");

      // =========================
      // SEND TO BACKEND
      // =========================
      const response = await axios.post(
        "http://localhost:8081/api/interviews/start",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // =========================
      // BACKEND RESPONSE
      // =========================
      const createdInterview =
        response.data;

      console.log(
        "Interview created:",
        createdInterview
      );

      // =========================
      // SAVE FOR NEXT PAGE
      // =========================
      sessionStorage.setItem(
        "interviewSetup",
        JSON.stringify({
          interviewId:
            createdInterview.interviewId,

          interviewType:
            createdInterview.interviewType,

          difficulty:
            createdInterview.difficulty,

          targetRole:
            createdInterview.targetRole,

          technicalFocus:
            createdInterview.technicalFocus,

          resumeName:
            createdInterview.resumeFileName,
        })
      );

      // =========================
      // NEXT PAGE
      // =========================
      navigate("/choose-interviewer");

    } catch (error) {
      console.error(
        "Start interview error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setMessage(
          "Your login session is invalid or expired. Please login again."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Unable to start interview. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8">

        {/* ================= HEADER ================= */}
        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
            Interview Setup
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">

            {interviewType === "Technical"
              ? "Technical Interview"
              : interviewType === "HR"
              ? "HR Interview"
              : "Start Your Interview"}

          </h1>

          <p className="mt-2 max-w-2xl text-slate-500">

            {interviewType === "Technical"
              ? "Set up your resume-based technical interview."
              : interviewType === "HR"
              ? "Set up your resume-based HR interview."
              : "Choose an interview type and provide the details needed to personalize your session."}

          </p>

        </div>

        <section className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.05)] md:p-8">

          {/* ================= INTERVIEW TYPE ================= */}

          {/* Show selector ONLY when user came from hero */}
          {!preselectedType && (
            <>
              <div>

                <h2 className="text-lg font-bold text-slate-950">
                  Interview Type
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose the interview you want to practice.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  {/* TECHNICAL */}
                  <button
                    type="button"
                    onClick={() =>
                      setInterviewType("Technical")
                    }
                    className={`rounded-[18px] border p-5 text-left transition ${
                      interviewType === "Technical"
                        ? "border-[#6D4DE8] bg-[#F5F1FF]"
                        : "border-slate-200 bg-white hover:border-purple-200"
                    }`}
                  >

                    <h3
                      className={`font-bold ${
                        interviewType === "Technical"
                          ? "text-[#6D4DE8]"
                          : "text-slate-900"
                      }`}
                    >
                      Technical Interview
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Resume-based technical and skill-specific questions.
                    </p>

                  </button>

                  {/* HR */}
                  <button
                    type="button"
                    onClick={() =>
                      setInterviewType("HR")
                    }
                    className={`rounded-[18px] border p-5 text-left transition ${
                      interviewType === "HR"
                        ? "border-[#6D4DE8] bg-[#F5F1FF]"
                        : "border-slate-200 bg-white hover:border-purple-200"
                    }`}
                  >

                    <h3
                      className={`font-bold ${
                        interviewType === "HR"
                          ? "text-[#6D4DE8]"
                          : "text-slate-900"
                      }`}
                    >
                      HR Interview
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Resume-based behavioral and HR questions.
                    </p>

                  </button>

                </div>

              </div>

              <div className="my-8 border-t border-slate-100" />
            </>
          )}

          {/* ================= SELECTED TYPE ================= */}

          {preselectedType && (
            <>
              <div className="rounded-[18px] border border-purple-100 bg-[#F8F5FF] px-5 py-4">

                <p className="text-sm font-medium text-slate-500">
                  Selected Interview
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#6D4DE8]">
                  {interviewType} Interview
                </h2>

              </div>

              <div className="my-8 border-t border-slate-100" />
            </>
          )}

          {/* ================= TARGET ROLE ================= */}
          <div>

            <label className="text-lg font-bold text-slate-950">
              Target Role
            </label>

            <p className="mt-1 text-sm text-slate-500">
              Enter the role you are preparing for.
            </p>

            <input
              type="text"
              value={targetRole}
              onChange={(event) =>
                setTargetRole(
                  event.target.value
                )
              }
              placeholder="Example: Java Developer"
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
            />

          </div>

          <div className="my-8 border-t border-slate-100" />

          {/* ================= DIFFICULTY ================= */}
          <div>

            <h2 className="text-lg font-bold text-slate-950">
              Difficulty
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the level of your interview questions.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">

              {[
                "Easy",
                "Medium",
                "Hard",
              ].map((level) => (

                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setDifficulty(level)
                  }
                  className={`rounded-xl border px-4 py-3 font-semibold transition ${
                    difficulty === level
                      ? "border-[#6D4DE8] bg-[#F0EBFF] text-[#6D4DE8]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {level}
                </button>

              ))}

            </div>

          </div>

          {/* ================= TECHNICAL FOCUS ================= */}

          {interviewType === "Technical" && (
            <>
              <div className="my-8 border-t border-slate-100" />

              <div>

                <label className="text-lg font-bold text-slate-950">
                  Technical Focus

                  <span className="ml-2 text-sm font-medium text-slate-400">
                    Optional
                  </span>
                </label>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add specific technologies or topics you want
                  the interview to focus on.
                </p>

                <input
                  type="text"
                  value={technicalFocus}
                  onChange={(event) =>
                    setTechnicalFocus(
                      event.target.value
                    )
                  }
                  placeholder="Example: Java, Spring Boot, SQL, DSA"
                  className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#6D4DE8] focus:ring-2 focus:ring-purple-100"
                />

              </div>

            </>
          )}

          <div className="my-8 border-t border-slate-100" />

          {/* ================= RESUME ================= */}
          <div>

            <h2 className="text-lg font-bold text-slate-950">
              Upload Resume
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              {interviewType === "Technical"
                ? "Your resume will be used to generate relevant technical questions."
                : interviewType === "HR"
                ? "Your resume will be used to generate personalized HR questions."
                : "Your resume will be used to personalize your interview."}

            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[18px] border-2 border-dashed border-slate-200 bg-[#FAFAFC] px-6 py-9 text-center transition hover:border-[#B9A8F2] hover:bg-[#F8F6FF]">

              {resume ? (
                <>
                  <p className="font-semibold text-slate-900">
                    {resume.name}
                  </p>

                  <p className="mt-2 text-sm font-medium text-[#6D4DE8]">
                    Resume selected
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Click to choose a different file
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-slate-900">
                    Upload your resume
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    PDF or DOCX · Maximum 5 MB
                  </p>
                </>
              )}

              <input
                type="file"
                accept=".pdf,.docx"
                onChange={
                  handleResumeChange
                }
                className="hidden"
              />

            </label>

          </div>

          {/* ================= ERROR ================= */}
          {message && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              {message}
            </p>
          )}

          {/* ================= START BUTTON ================= */}
          <div className="mt-8 flex justify-end">

            <button
              type="button"
              onClick={handleStartInterview}
              disabled={loading}
              className="rounded-xl bg-[#6D4DE8] px-7 py-3.5 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating Interview..."
                : interviewType === "Technical"
                ? "Start Technical Interview"
                : interviewType === "HR"
                ? "Start HR Interview"
                : "Start Interview"}
            </button>

          </div>

        </section>

      </main>
    </div>
  );
}

export default StartInterview;