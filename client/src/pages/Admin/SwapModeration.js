import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SwapModeration() {
  const [swaps, setSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSwaps = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/admin/swaps");
        setSwaps(res.data.swaps);
      } catch (e) {
        setError(
          e.response?.data?.message ||
          (e.response?.data && JSON.stringify(e.response.data)) ||
          "Failed to fetch swaps"
        );
        setSwaps([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSwaps();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Swap Moderation</h1>
      {loading ? (
        <div>Loading swaps...</div>
      ) : error ? (
        <div className="text-red-500 mb-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded shadow">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Requester</th>
                <th className="py-2 px-4 border-b">Recipient</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Requested At</th>
              </tr>
            </thead>
            <tbody>
              {swaps.map((swap) => (
                <tr key={swap._id} className="text-center">
                  <td className="py-2 px-4 border-b">
                    {swap.requesterId?.name} <br />
                    <span className="text-xs text-gray-500">{swap.requesterId?.email}</span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {swap.recipientId?.name} <br />
                    <span className="text-xs text-gray-500">{swap.recipientId?.email}</span>
                  </td>
                  <td className="py-2 px-4 border-b capitalize">{swap.status}</td>
                  <td className="py-2 px-4 border-b">{new Date(swap.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {swaps.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-gray-400">
                    No swap requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 