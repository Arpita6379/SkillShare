import React from "react";

const typeStyles = {
  success: "bg-green-100 border-green-400 text-green-700",
  error: "bg-red-100 border-red-400 text-red-700",
  info: "bg-blue-100 border-blue-400 text-blue-700",
};

export default function Notification({ message, type = "info", onClose }) {
  if (!message) return null;
  return (
    <div
      className={`fixed top-5 right-5 z-50 border-l-4 p-4 rounded shadow-lg flex items-center space-x-2 transition-all duration-300 ${typeStyles[type]}`}
      role="alert"
    >
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-xl font-bold focus:outline-none"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
} 