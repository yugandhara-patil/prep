import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

import maleInterviewer from "../assets/men.jpg";
import femaleInterviewer from "../assets/women.jpg";

function ChooseInterviewer() {
  const navigate = useNavigate();

  const [selectedInterviewer, setSelectedInterviewer] =
    useState("");

  const interviewers = [
    {
      id: "alex",
      name: "Alex",
      image: maleInterviewer,
      label: "Male Interviewer",
    },
    {
      id: "maya",
      name: "Maya",
      image: femaleInterviewer,
      label: "Female Interviewer",
    },
  ];

  function handleContinue() {
    if (!selectedInterviewer) {
      return;
    }

    const interviewer = interviewers.find(
      (item) => item.id === selectedInterviewer
    );

    sessionStorage.setItem(
      "selectedInterviewer",
      JSON.stringify({
        id: interviewer.id,
        name: interviewer.name,
      })
    );

    navigate("/interview");
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8">

        {/* HEADER */}
        <div className="mb-8 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
            Interview Setup
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">
            Choose Your Interviewer
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Select the interviewer you would like to practice with.
          </p>

        </div>


        {/* INTERVIEWER CARDS */}
        <div className="grid gap-6 md:grid-cols-2">

          {interviewers.map((interviewer) => {
            const isSelected =
              selectedInterviewer === interviewer.id;

            return (
              <button
                key={interviewer.id}
                type="button"
                onClick={() =>
                  setSelectedInterviewer(interviewer.id)
                }
                className={`group overflow-hidden rounded-[24px] border bg-white text-left transition duration-200 ${
                  isSelected
                    ? "border-[#6D4DE8] shadow-[0_12px_35px_rgba(109,77,232,0.15)] ring-1 ring-[#6D4DE8]"
                    : "border-slate-200 hover:border-purple-200 hover:shadow-lg"
                }`}
              >

                {/* IMAGE */}
                <div className="relative h-[330px] overflow-hidden bg-slate-100">

                  <img
                    src={interviewer.image}
                    alt={`${interviewer.name} interviewer`}
                    className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-[1.02]"
                  />

                  {/* SELECTED BADGE */}
                  {isSelected && (
                    <div className="absolute right-4 top-4 rounded-full bg-[#6D4DE8] px-3 py-1.5 text-xs font-semibold text-white shadow">
                      Selected
                    </div>
                  )}

                </div>


                {/* INTERVIEWER DETAILS */}
                <div className="p-5">

                  <div className="flex items-center justify-between gap-4">

                    <div>
                      <h2 className="text-xl font-bold text-slate-950">
                        {interviewer.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {interviewer.label}
                      </p>
                    </div>


                    {/* RADIO INDICATOR */}
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-[#6D4DE8]"
                          : "border-slate-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-3 w-3 rounded-full bg-[#6D4DE8]" />
                      )}
                    </div>

                  </div>

                </div>

              </button>
            );
          })}

        </div>


        {/* CONTINUE */}
        <div className="mt-8 flex flex-col items-center">

          <button
            type="button"
            disabled={!selectedInterviewer}
            onClick={handleContinue}
            className="min-w-[220px] rounded-xl bg-[#6D4DE8] px-8 py-3.5 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            Continue to Interview
          </button>

          {!selectedInterviewer && (
            <p className="mt-3 text-sm text-slate-400">
              Select an interviewer to continue.
            </p>
          )}

        </div>

      </main>
    </div>
  );
}

export default ChooseInterviewer;