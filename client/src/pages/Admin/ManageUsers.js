import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [bio, setBio] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/admin/users");
        setUsers(res.data.users);
      } catch (e) {
        alert(
          e.response?.data?.message ||
          (e.response?.data && JSON.stringify(e.response.data)) ||
          "Failed to fetch users"
        );
      }
    };
    fetchUsers();
  }, []);

  const handleBanToggle = async (id, banned) => {
    try {
      if (banned) {
        await axios.put(`/api/admin/users/${id}/unban`);
      } else {
        await axios.put(`/api/admin/users/${id}/ban`);
      }
      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, banned: !banned } : u
        )
      );
    } catch (e) {
      alert(
        e.response?.data?.message ||
        (e.response?.data && JSON.stringify(e.response.data)) ||
        'Failed to update ban status'
      );
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setSkillsOffered(user.skillsOffered || []);
    setSkillsWanted(user.skillsWanted || []);
    setBio(user.bio || "");
    setModalError("");
  };
  const closeEditModal = () => {
    setEditingUser(null);
    setSkillsOffered([]);
    setSkillsWanted([]);
    setBio("");
    setModalError("");
  };
  const handleSave = async () => {
    setSaving(true);
    setModalError("");
    try {
      await axios.put(`/api/admin/users/${editingUser._id}/skills`, {
        skillsOffered,
        skillsWanted,
        bio,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u._id === editingUser._id
            ? { ...u, skillsOffered, skillsWanted, bio }
            : u
        )
      );
      closeEditModal();
    } catch (e) {
      setModalError(
        e.response?.data?.message ||
        (e.response?.data && JSON.stringify(e.response.data)) ||
        "Failed to update skills/bio"
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <input
        type="text"
        placeholder="Search by name or email..."
        className="mb-4 px-3 py-2 border rounded w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Name</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Role</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} className="text-center">
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b capitalize">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  {user.banned ? (
                    <span className="text-red-600 font-semibold">Banned</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Active</span>
                  )}
                </td>
                <td className="py-2 px-4 border-b flex flex-col gap-2 items-center">
                  <button
                    className={`px-3 py-1 rounded text-white text-sm ${
                      user.banned
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    onClick={() => handleBanToggle(user._id, user.banned)}
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
                    onClick={() => openEditModal(user)}
                  >
                    Edit Skills/Bio
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Skills/Bio Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeEditModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Edit Skills/Bio for {editingUser.name}</h2>
            {modalError && <div className="text-red-500 text-sm mb-2">{modalError}</div>}
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Skills Offered (comma separated)</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={skillsOffered.join(", ")}
                onChange={e => setSkillsOffered(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Skills Wanted (comma separated)</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={skillsWanted.join(", ")}
                onChange={e => setSkillsWanted(e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea
                className="w-full border rounded px-2 py-1"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="btn btn-secondary"
                onClick={closeEditModal}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 