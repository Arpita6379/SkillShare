import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/announcements");
      setAnnouncements(res.data.announcements);
    } catch (e) {
      setError("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    setPosting(true);
    setError("");
    try {
      await axios.post("/api/announcements", { title, content });
      setTitle("");
      setContent("");
      fetchAnnouncements();
    } catch (e) {
      setError(
        e.response?.data?.message ||
        (e.response?.data && JSON.stringify(e.response.data)) ||
        "Failed to post announcement"
      );
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Announcements</h1>
      <form onSubmit={handlePost} className="mb-6 bg-white p-4 rounded shadow">
        <input
          type="text"
          placeholder="Title"
          className="mb-2 px-3 py-2 border rounded w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Announcement content..."
          className="mb-2 px-3 py-2 border rounded w-full"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={posting}
        >
          {posting ? "Posting..." : "Post Announcement"}
        </button>
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      </form>
      <div className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : announcements.length === 0 ? (
          <div className="text-gray-400">No announcements yet.</div>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="bg-white p-4 rounded shadow border">
              <div className="font-semibold text-lg mb-1">{a.title}</div>
              <div className="text-gray-700 mb-2">{a.content}</div>
              <div className="text-xs text-gray-400">
                {a.createdBy?.name ? `By ${a.createdBy.name}` : ""} {new Date(a.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 