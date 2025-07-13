import React from "react";

export default function SwapRequestModal({
  isOpen,
  onClose,
  onAction,
  actionType = "send", // send | accept | reject | delete
  user = {},
  loading = false,
  error = "",
}) {
  if (!isOpen) return null;
  const actionLabels = {
    send: "Send Swap Request",
    accept: "Accept Request",
    reject: "Reject Request",
    delete: "Delete Request",
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">{actionLabels[actionType]}</h2>
        <div className="flex items-center mb-4">
          <img
            src={user.profilePhotoURL || "/default-avatar.png"}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border mr-3"
          />
          <div>
            <div className="font-medium">{user.name}</div>
            {user.location && <div className="text-xs text-gray-500">{user.location}</div>}
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${
              actionType === "send"
                ? "bg-blue-600 hover:bg-blue-700"
                : actionType === "accept"
                ? "bg-green-600 hover:bg-green-700"
                : actionType === "reject"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gray-600 hover:bg-gray-700"
            }`}
            onClick={onAction}
            disabled={loading}
          >
            {loading ? "Processing..." : actionLabels[actionType]}
          </button>
        </div>
      </div>
    </div>
  );
} 