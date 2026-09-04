import avatarImage from "../assets/avatar.png";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const userName =
    user?.fullName?.split(" ")[0] || "User";

  const practiceTypes = [
    {
      title: "Technical Interview",
      description:
        "Practice resume-based technical and role-specific questions.",
      type: "Technical",
    },
    {
      title: "HR Interview",
      description:
        "Practice resume-based behavioral and HR interview questions.",
      type: "HR",
    },
    {
      title: "Practice Questions",
      description:
        "Practice aptitude and technical MCQs by topic.",
      type: "Practice",
    },
  ];

  const recentActivities = [];

  // =========================
  // PRACTICE CARD CLICK
  // =========================
  function handlePracticeClick(type) {
    if (type === "Technical") {
      navigate("/start-interview", {
        state: {
          interviewType: "Technical",
        },
      });

      return;
    }

    if (type === "HR") {
      navigate("/start-interview", {
        state: {
          interviewType: "HR",
        },
      });

      return;
    }

    if (type === "Practice") {
      navigate("/practice-questions");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FC]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-6 md:px-8 lg:px-10">

        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden rounded-[28px] border border-purple-100 bg-gradient-to-br from-white via-[#FCFAFF] to-[#EEE8FF] px-7 py-9 shadow-[0_16px_50px_rgba(109,77,232,0.08)] md:min-h-[410px] md:px-11 md:py-11 lg:px-14">

          <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-purple-300/15 blur-3xl" />

          <div className="absolute -bottom-28 right-0 h-96 w-96 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative z-20 max-w-[610px]">

            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#8A78C8]">
              Welcome back
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-slate-950 md:text-4xl">
              Good Evening, {userName}
            </h1>

            <p className="mt-2 text-slate-500">
              Let&apos;s get interview-ready today.
            </p>

            <h2 className="mt-8 text-4xl font-extrabold leading-[1.08] text-slate-950 md:text-5xl lg:text-[56px]">
              Practice Smarter Interviews with{" "}
              <span className="bg-gradient-to-r from-[#6D4DE8] to-[#9A79FF] bg-clip-text text-transparent">
                AI
              </span>
            </h2>

            <p className="mt-5 max-w-[520px] text-base leading-7 text-slate-600 md:text-lg">
              Practice technical and HR interviews with personalized
              questions and structured feedback.
            </p>

            {/* HERO START BUTTON */}
            <button
              type="button"
              onClick={() =>
                navigate("/start-interview")
              }
              className="mt-7 rounded-xl bg-[#6D4DE8] px-7 py-3.5 font-semibold text-white shadow-md shadow-purple-200 transition hover:bg-[#5E3FD1]"
            >
              Start Interview
            </button>

          </div>

          {/* AVATAR */}
          <div className="relative mt-10 flex justify-center md:absolute md:bottom-0 md:right-5 md:mt-0 md:w-[44%] lg:right-10">

            <div className="absolute bottom-3 h-[300px] w-[300px] rounded-full bg-[#EEE8FF] md:h-[360px] md:w-[360px]" />

            <img
              src={avatarImage}
              alt="AI Interview Coach"
              className="relative z-20 max-h-[330px] object-contain md:max-h-[410px]"
            />

          </div>

        </section>


        {/* ================= PROGRESS ================= */}
        <section className="mt-10">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-slate-950">
              Your Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your interview performance will appear here after you complete sessions.
            </p>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <StatCard
              value="—"
              label="Interviews Completed"
            />

            <StatCard
              value="—"
              label="Average Score"
            />

            <StatCard
              value="—"
              label="Practice Time"
            />

          </div>

        </section>


        {/* ================= PRACTICE TYPES ================= */}
        <section className="mt-10">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-slate-950">
              Practice Types
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose how you want to prepare.
            </p>

          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {practiceTypes.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() =>
                  handlePracticeClick(item.type)
                }
                className="group rounded-[20px] border border-slate-200 bg-white p-6 text-left transition hover:border-[#B9A8F2] hover:shadow-md"
              >

                <div className="flex h-full flex-col">

                  <h3 className="text-lg font-semibold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <p className="mt-5 text-sm font-semibold text-[#6D4DE8]">
                    Continue →
                  </p>

                </div>

              </button>
            ))}

          </div>

        </section>


        {/* ================= RECENT ACTIVITY ================= */}
        <section className="mt-10">

          <div className="mb-5">

            <h2 className="text-2xl font-bold text-slate-950">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your completed interview sessions will appear here.
            </p>

          </div>

          {recentActivities.length > 0 ? (
            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white">

              {recentActivities.map(
                (activity, index) => (
                  <button
                    key={activity.id || index}
                    type="button"
                    className={`flex w-full items-center gap-4 p-5 text-left transition hover:bg-slate-50 ${
                      index !==
                      recentActivities.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >

                    <div className="flex-1">

                      <h3 className="font-semibold text-slate-950">
                        {activity.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {activity.subtitle}
                      </p>

                    </div>

                    <p className="font-semibold text-slate-900">
                      {activity.value}
                    </p>

                  </button>
                )
              )}

            </div>
          ) : (
            <div className="rounded-[20px] border border-slate-200 bg-white px-6 py-10 text-center">

              <h3 className="font-semibold text-slate-900">
                No interview activity yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Complete your first interview and your recent sessions will appear here.
              </p>

            </div>
          )}

        </section>

      </main>
    </div>
  );
}


function StatCard({ value, label }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-6">

      <p className="text-3xl font-bold text-slate-950">
        {value}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-500">
        {label}
      </p>

    </div>
  );
}

export default Home;