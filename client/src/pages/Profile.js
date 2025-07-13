import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, MapPin, Eye, EyeOff, Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bio: '',
    isPublic: true
  });
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsWanted, setSkillsWanted] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhotoURL || '');
  const [photoFile, setPhotoFile] = useState(null);

  const availabilityOptions = [
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'evenings', label: 'Evenings' },
    { value: 'mornings', label: 'Mornings' },
    { value: 'afternoons', label: 'Afternoons' },
    { value: 'flexible', label: 'Flexible' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        location: user.location || '',
        bio: user.bio || '',
        isPublic: user.isPublic !== false
      });
      setSkillsOffered(user.skillsOffered || []);
      setSkillsWanted(user.skillsWanted || []);
      setAvailability(user.availability || []);
      setPhotoPreview(user.profilePhotoURL || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !skillsOffered.includes(newSkillOffered.trim())) {
      setSkillsOffered(prev => [...prev, newSkillOffered.trim()]);
      setNewSkillOffered('');
    }
  };

  const removeSkillOffered = (skill) => {
    setSkillsOffered(prev => prev.filter(s => s !== skill));
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !skillsWanted.includes(newSkillWanted.trim())) {
      setSkillsWanted(prev => [...prev, newSkillWanted.trim()]);
      setNewSkillWanted('');
    }
  };

  const removeSkillWanted = (skill) => {
    setSkillsWanted(prev => prev.filter(s => s !== skill));
  };

  const toggleAvailability = (option) => {
    setAvailability(prev => 
      prev.includes(option)
        ? prev.filter(a => a !== option)
        : [...prev, option]
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    const formData = new FormData();
    formData.append('photo', photoFile);
    try {
      setLoading(true);
      const res = await axios.post(`/api/users/${user.id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPhotoPreview(res.data.profilePhotoURL);
      toast.success('Profile photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        skillsOffered,
        skillsWanted,
        availability
      };
      console.log('Submitting updateData:', updateData); // Debug: log data being sent

      const result = await updateProfile(updateData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      } else if (result.message) {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Update your profile information, skills, and preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Upload */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-6">
          <div>
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-3xl text-primary-600">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="mb-2" />
            <button
              type="button"
              onClick={handlePhotoUpload}
              disabled={!photoFile || loading}
              className="btn btn-primary"
            >
              {loading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Tell others about yourself..."
              />
            </div>

            {/* Public/Private Toggle */}
            <div className="flex items-center justify-between">
              <label htmlFor="isPublic" className="block text-sm font-medium text-gray-700">
                Profile Visibility
              </label>
              <div className="flex items-center gap-2">
                <span className={formData.isPublic ? "text-blue-600" : "text-gray-500"}>
                  {formData.isPublic ? "Public" : "Private"}
                </span>
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Offered */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Skills I Can Teach</h2>
            <p className="text-sm text-gray-500">Add skills you're confident teaching to others</p>
          </div>
          <div className="p-6">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newSkillOffered}
                onChange={(e) => setNewSkillOffered(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add a skill you can teach"
              />
              <button
                type="button"
                onClick={addSkillOffered}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillOffered(skill)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills Wanted */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Skills I Want to Learn</h2>
            <p className="text-sm text-gray-500">Add skills you'd like to learn from others</p>
          </div>
          <div className="p-6">
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newSkillWanted}
                onChange={(e) => setNewSkillWanted(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                className="flex-1 block px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add a skill you want to learn"
              />
              <button
                type="button"
                onClick={addSkillWanted}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillWanted(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Availability</h2>
            <p className="text-sm text-gray-500">Select when you're typically available for skill swaps</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availabilityOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={availability.includes(option.value)}
                    onChange={() => toggleAvailability(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>

      {/* Promote to Admin button (for development/demo only) */}
      {user.role !== 'admin' && (
        <button
          onClick={async () => {
            try {
              await axios.put(`/api/users/${user.id}`, { role: 'admin' });
              alert('You are now an admin! Please log out and log in again.');
            } catch (e) {
              alert('Failed to promote to admin.');
            }
          }}
          className="btn btn-warning mt-4"
        >
          Promote Me to Admin
        </button>
      )}
    </div>
  );
};

export default Profile; 