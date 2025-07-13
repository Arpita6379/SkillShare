import React, { useState } from "react";

// Mock data for demonstration
const mockFeedback = [
  {
    _id: "f1",
    from: "Alice Smith",
    to: "Bob Jones",
    rating: 5,
    comment: "Great swap! Learned a lot.",
    createdAt: new Date().toLocaleString(),
  },
  {
    _id: "f2",
    from: "Charlie Brown",
    to: "Alice Smith",
    rating: 4,
    comment: "Very helpful and friendly.",
    createdAt: new Date().toLocaleString(),
  },
];

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState(mockFeedback);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating) return;
    setFeedbacks([
      {
        _id: Date.now().toString(),
        from: "You",
        to: "User Name",
        rating,
        comment,
        createdAt: new Date().toLocaleString(),
      },
      ...feedbacks,
    ]);
    setRating(0);
    setComment("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Leave Feedback</h1>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm">Rating:</span>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea
          placeholder="Leave a comment (optional)"
          className="mb-2 px-3 py-2 border rounded w-full"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Feedback
        </button>
      </form>
      <h2 className="text-xl font-semibold mb-2">Feedback Received</h2>
      <div className="space-y-4">
        {feedbacks.map((f) => (
          <div key={f._id} className="bg-white p-4 rounded shadow border">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">{f.from}</span>
              <span className="text-xs text-gray-400">to {f.to}</span>
              <span className="ml-auto text-yellow-400 text-lg">{'★'.repeat(f.rating)}<span className="text-gray-300">{'★'.repeat(5 - f.rating)}</span></span>
            </div>
            <div className="text-gray-700 mb-1">{f.comment}</div>
            <div className="text-xs text-gray-400">{f.createdAt}</div>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="text-gray-400">No feedback yet.</div>
        )}
      </div>
    </div>
  );
} 