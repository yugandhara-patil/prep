import React, { useEffect, useState } from "react";

import axios from "axios";



const OverallPerformance = () => {

  const [performance, setPerformance] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");



  useEffect(() => {

    fetchPerformance();

  }, []);



  const fetchPerformance = async () => {

    try {

      setLoading(true);

      setError("");



      const token = localStorage.getItem("token");



      const response = await axios.get(

        `${import.meta.env.VITE_API_URL}/api/interviews/overall-performance`,

        {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      console.log("Overall performance:", response.data);



      setPerformance(response.data);

    } catch (err) {

      console.error("Failed to load overall performance:", err);



      setError(

        err.response?.data?.message ||

          "Unable to load your overall performance."

      );

    } finally {

      setLoading(false);

    }

  };



  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p className="text-gray-500">

          Loading your performance...

        </p>

      </div>

    );

  }



  if (error) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <div className="text-center">

          <p className="text-red-500 mb-4">{error}</p>



          <button

            onClick={fetchPerformance}

            className="px-5 py-2 rounded-lg bg-black text-white"

          >

            Try Again

          </button>

        </div>

      </div>

    );

  }



  if (!performance) {

    return null;

  }



  return (

    <div className="min-h-screen bg-gray-50 px-6 py-10">



      {/* Header */}

      <div className="max-w-7xl mx-auto mb-8">

        <h1 className="text-3xl font-bold text-gray-900">

          Overall Performance

        </h1>



        <p className="text-gray-500 mt-2">

          Track your interview progress and identify areas for improvement.

        </p>

      </div>





      <div className="max-w-7xl mx-auto space-y-6">



        {/* Top Statistics */}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">



          <StatCard

            title="Total Interviews"

            value={performance.totalInterviews}

          />



          <StatCard

            title="Average Score"

            value={`${performance.averageScore}%`}

          />



          <StatCard

            title="Best Score"

            value={`${performance.bestScore}%`}

          />



          <StatCard

            title="Practice Time"

            value={`${performance.totalPracticeMinutes} min`}

          />



        </div>





        {/* Performance Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Performance Breakdown
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Compare your performance across the key evaluation areas.
            </p>
          </div>

          <PerformanceChart
            data={[
              { label: "Technical Knowledge", score: performance.technicalAverage },
              { label: "Communication", score: performance.communicationAverage },
              { label: "Project Knowledge", score: performance.projectAverage },
              { label: "Response Quality", score: performance.responseQualityAverage },
            ]}
          />
        </div>


        {/* Strengths + Areas */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">



          <div className="bg-white rounded-2xl border border-gray-200 p-6">



            <h2 className="text-xl font-semibold text-gray-900 mb-5">

              Your Strengths

            </h2>



            {performance.strengths?.length > 0 ? (



              <ul className="space-y-3">



                {performance.strengths.map((strength, index) => (



                  <li

                    key={index}

                    className="flex items-start gap-3 text-gray-700"

                  >

                    <span className="mt-1">

                      ✓

                    </span>



                    <span>{strength}</span>

                  </li>



                ))}



              </ul>



            ) : (



              <p className="text-gray-500">

                Keep practising to identify your strongest areas.

              </p>



            )}



          </div>





          <div className="bg-white rounded-2xl border border-gray-200 p-6">



            <h2 className="text-xl font-semibold text-gray-900 mb-5">

              Areas to Improve

            </h2>



            {performance.areasToImprove?.length > 0 ? (



              <ul className="space-y-3">



                {performance.areasToImprove.map((area, index) => (



                  <li

                    key={index}

                    className="flex items-start gap-3 text-gray-700"

                  >

                    <span className="mt-1">

                      •

                    </span>



                    <span>{area}</span>

                  </li>



                ))}



              </ul>



            ) : (



              <p className="text-gray-500">

                Complete more interviews to identify specific areas for improvement.

              </p>



            )}



          </div>



        </div>





        {/* Recent Interviews */}

        <div className="bg-white rounded-2xl border border-gray-200 p-6">



          <h2 className="text-xl font-semibold text-gray-900 mb-6">

            Recent Interviews

          </h2>



          {performance.recentInterviews?.length > 0 ? (



            <div className="overflow-x-auto">



              <table className="w-full text-left">



                <thead>

                  <tr className="border-b border-gray-200">



                    <th className="py-3 pr-4 text-sm text-gray-500">

                      Type

                    </th>



                    <th className="py-3 pr-4 text-sm text-gray-500">

                      Role

                    </th>



                    <th className="py-3 pr-4 text-sm text-gray-500">

                      Difficulty

                    </th>



                    <th className="py-3 text-sm text-gray-500">

                      Score

                    </th>



                  </tr>

                </thead>



                <tbody>



                  {performance.recentInterviews.map(

                    (interview) => (



                      <tr

                        key={interview.interviewId}

                        className="border-b border-gray-100 last:border-0"

                      >



                        <td className="py-4 pr-4 font-medium">

                          {formatLabel(interview.interviewType)}

                        </td>



                        <td className="py-4 pr-4 text-gray-600">

                          {interview.targetRole || "—"}

                        </td>



                        <td className="py-4 pr-4 text-gray-600">

                          {formatLabel(interview.difficulty)}

                        </td>



                        <td className="py-4 font-semibold">

                          {interview.score}%

                        </td>



                      </tr>



                    )

                  )}



                </tbody>



              </table>



            </div>



          ) : (



            <p className="text-gray-500">

              No completed interviews yet.

            </p>



          )}



        </div>



      </div>



    </div>

  );

};





const PerformanceChart = ({ data }) => {
  const chartWidth = 760;
  const chartHeight = 300;
  const chartLeft = 55;
  const chartBottom = 55;
  const chartTop = 20;
  const chartRight = 20;
  const plotWidth = chartWidth - chartLeft - chartRight;
  const plotHeight = chartHeight - chartTop - chartBottom;
  const barWidth = 72;
  const gap = (plotWidth - data.length * barWidth) / (data.length + 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[680px] h-[300px]" role="img" aria-label="Performance breakdown chart">
        {[0, 25, 50, 75, 100].map((value) => {
          const y = chartTop + plotHeight - (value / 100) * plotHeight;
          return (
            <g key={value}>
              <line x1={chartLeft} x2={chartWidth - chartRight} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={chartLeft - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#6b7280">{value}%</text>
            </g>
          );
        })}
        {data.map(({ label, score }, index) => {
          const hasScore = score !== null && score !== undefined;
          const safeScore = hasScore ? Math.min(Math.max(Number(score) || 0, 0), 100) : 0;
          const x = chartLeft + gap + index * (barWidth + gap);
          const barHeight = (safeScore / 100) * plotHeight;
          const y = chartTop + plotHeight - barHeight;
          return (
            <g key={label}>
              {hasScore ? (
                <>
                  <rect x={x} y={y} width={barWidth} height={barHeight} rx="8" fill="#111827" />
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="13" fontWeight="600" fill="#111827">{Number(score).toFixed(1)}%</text>
                </>
              ) : (
                <text x={x + barWidth / 2} y={chartTop + plotHeight - 8} textAnchor="middle" fontSize="11" fill="#9ca3af">No data</text>
              )}
              <text x={x + barWidth / 2} y={chartHeight - 30} textAnchor="middle" fontSize="11" fill="#4b5563">
                {label.length > 18 ? (
                  <>
                    <tspan x={x + barWidth / 2} dy="0">{label.split(" ")[0]}</tspan>
                    <tspan x={x + barWidth / 2} dy="14">{label.split(" ").slice(1).join(" ")}</tspan>
                  </>
                ) : label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const StatCard = ({ title, value }) => {

  return (

    <div className="bg-white rounded-2xl border border-gray-200 p-6">



      <p className="text-sm text-gray-500">

        {title}

      </p>



      <p className="text-2xl font-bold text-gray-900 mt-2">

        {value}

      </p>



    </div>

  );

};





const ScoreCard = ({ title, score }) => {

  return (

    <div>



      <div className="flex justify-between mb-2">



        <span className="text-sm text-gray-600">

          {title}

        </span>



        <span className="font-semibold text-gray-900">

          {score}%

        </span>



      </div>



      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">



        <div

          className="h-full bg-gray-900 rounded-full"

          style={{

            width: `${Math.min(Math.max(score || 0, 0), 100)}%`,

          }}

        />



      </div>



    </div>

  );

};





const formatLabel = (value) => {

  if (!value) {

    return "Unknown";

  }



  return value

    .toLowerCase()

    .replace(/_/g, " ")

    .replace(/\b\w/g, (char) => char.toUpperCase());

};





export default OverallPerformance;