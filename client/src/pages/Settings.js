import React, { useState } from "react";

export default function Settings() {
  const [isPublic, setIsPublic] = useState(true);
  const [deleted, setDeleted] = useState(false);

  const handleToggle = () => setIsPublic((prev) => !prev);
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      setDeleted(true);
    }
  };

  if (deleted) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Account Deleted</h1>
        <p className="text-gray-600">Your account has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">Profile Visibility</span>
          <button
            onClick={handleToggle}
            className={`px-4 py-2 rounded text-white font-semibold focus:outline-none ${isPublic ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-500 hover:bg-gray-600"}`}
          >
            {isPublic ? "Public" : "Private"}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-red-600">Delete Account</span>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <div className="mb-2">
          <span className="font-medium">Current Settings:</span>
        </div>
        <ul className="list-disc list-inside text-gray-700">
          <li>Profile is <span className={isPublic ? "text-blue-600" : "text-gray-600"}>{isPublic ? "Public" : "Private"}</span></li>
        </ul>
      </div>
    </div>
  );
} 