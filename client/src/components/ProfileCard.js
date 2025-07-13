import React from "react";
// import SkillBadge from "./SkillBadge"; // Uncomment when SkillBadge is created

export default function ProfileCard({
  name,
  location,
  profilePhotoURL,
  skillsOffered = [],
  skillsWanted = [],
  availability = [],
  isPublic = true,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center w-full max-w-sm border border-gray-100 relative">
      <img
        src={profilePhotoURL || "/default-avatar.png"}
        alt={name}
        className="w-20 h-20 rounded-full object-cover border-2 border-blue-200 mb-3"
      />
      <h2 className="text-lg font-semibold mb-1">{name}</h2>
      {location && <p className="text-gray-500 text-sm mb-2">{location}</p>}
      <div className="mb-2 w-full">
        <div className="text-xs text-gray-400">Skills Offered:</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {/* {skillsOffered.map(skill => <SkillBadge key={skill} skill={skill} />)} */}
          {skillsOffered.map(skill => (
            <span key={skill} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{skill}</span>
          ))}
        </div>
      </div>
      <div className="mb-2 w-full">
        <div className="text-xs text-gray-400">Skills Wanted:</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {/* {skillsWanted.map(skill => <SkillBadge key={skill} skill={skill} />)} */}
          {skillsWanted.map(skill => (
            <span key={skill} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">{skill}</span>
          ))}
        </div>
      </div>
      <div className="mb-2 w-full">
        <div className="text-xs text-gray-400">Availability:</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {availability.map(time => (
            <span key={time} className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs">{time}</span>
          ))}
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${isPublic ? "bg-blue-200 text-blue-800" : "bg-gray-300 text-gray-600"}`}>
          {isPublic ? "Public" : "Private"}
        </span>
      </div>
    </div>
  );
} 