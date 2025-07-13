import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ReportsDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/admin/reports/activity");
        setReport(res.data.report);
      } catch (e) {
        setError(
          e.response?.data?.message ||
          (e.response?.data && JSON.stringify(e.response.data)) ||
          "Failed to fetch report"
        );
        setReport(null);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handleDownload = (type) => {
    // Placeholder for download logic
    alert(`Download ${type} report (not implemented)`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reports Dashboard</h1>
      {loading ? (
        <div>Loading report...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : report ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">Activity Log Summary</div>
            <div className="text-gray-700 mb-2">
              Total users: {report.users.total}<br />
              New users (last {report.period}): {report.users.new}<br />
              Banned users: {report.users.banned}
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleDownload("activity")}
            >
              Download Activity Log
            </button>
          </div>
          <div className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">Feedback Summary</div>
            <div className="text-gray-700 mb-2">
              Average rating: {report.feedback.averageRating}<br />
              Total feedback: {report.feedback.total}<br />
              Recent feedback (last {report.period}): {report.feedback.recent}
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleDownload("feedback")}
            >
              Download Feedback Report
            </button>
          </div>
          <div className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">Swap Statistics</div>
            <div className="text-gray-700 mb-2">
              Total swaps: {report.swaps.total}<br />
              Recent swaps (last {report.period}): {report.swaps.recent}<br />
              Pending: {report.swaps.pending}<br />
              Completed: {report.swaps.completed}
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => handleDownload("swaps")}
            >
              Download Swap Stats
            </button>
          </div>
          <div className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">Top Skills Offered</div>
            <div className="text-gray-700 mb-2">
              {report.topSkills.offered.length === 0 ? (
                <span className="text-gray-400">No data</span>
              ) : (
                <ul className="list-disc ml-5">
                  {report.topSkills.offered.map(skill => (
                    <li key={skill._id}>{skill._id} ({skill.count})</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow border">
            <div className="font-semibold mb-1">Top Skills Wanted</div>
            <div className="text-gray-700 mb-2">
              {report.topSkills.wanted.length === 0 ? (
                <span className="text-gray-400">No data</span>
              ) : (
                <ul className="list-disc ml-5">
                  {report.topSkills.wanted.map(skill => (
                    <li key={skill._id}>{skill._id} ({skill.count})</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
} 