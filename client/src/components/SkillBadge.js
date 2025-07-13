import React from "react";

export default function SkillBadge({ skill, type = "offered" }) {
  const color =
    type === "offered"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>{skill}</span>
  );
} 