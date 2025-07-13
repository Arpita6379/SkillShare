import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { MapPin, Star, MessageSquare, Clock } from 'lucide-react';
import SwapRequestModal from '../components/SwapRequestModal';
import toast from 'react-hot-toast';
import StarRating from '../components/StarRating';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [requesterSkill, setRequesterSkill] = useState('');
  const [recipientSkill, setRecipientSkill] = useState('');
  const [sending, setSending] = useState(false);
  const [modalError, setModalError] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data.user);
        setErrorMsg('');
      } catch (error) {
        if (error.response && error.response.status === 403 && error.response.data.message === 'This profile is private') {
          setErrorMsg('This user profile is private.');
        } else {
          setErrorMsg('The user you\'re looking for doesn\'t exist or their profile is private.');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    setFeedbackLoading(true);
    setFeedbackError("");
    axios.get(`/api/feedback/user/${user._id || user.id}`)
      .then(res => {
        setFeedback(res.data.feedback);
      })
      .catch(e => {
        setFeedbackError(
          e.response?.data?.message ||
          (e.response?.data && JSON.stringify(e.response.data)) ||
          "Failed to load feedback"
        );
        setFeedback([]);
      })
      .finally(() => setFeedbackLoading(false));
  }, [user]);

  const openModal = () => {
    setRequesterSkill(currentUser?.skillsOffered?.[0] || '');
    setRecipientSkill(user?.skillsOffered?.[0] || '');
    setModalError('');
    setShowModal(true);
  };

  const handleSendSwap = async () => {
    if (!requesterSkill || !recipientSkill) {
      setModalError('Please select both skills.');
      return;
    }
    setSending(true);
    setModalError('');
    try {
      const recipientId = user._id || user.id;
      console.log('user object:', user);
      console.log('recipientId:', recipientId, typeof recipientId);
      await axios.post('/api/swaps', {
        recipientId,
        requesterSkill,
        recipientSkill
      });
      toast.success('Swap request sent!');
      setShowModal(false);
    } catch (error) {
      console.error('Swap request error:', error.response?.data || error);
      setModalError(
        error.response?.data?.errors?.[0]?.msg ||
        error.response?.data?.message ||
        (error.response?.data && JSON.stringify(error.response.data)) ||
        'Failed to send swap request'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">{errorMsg ? (errorMsg === 'This user profile is private.' ? 'Profile is Private' : 'User not found') : 'User not found'}</h2>
        <p className="text-gray-600 mt-2">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Swap Request Modal */}
      <SwapRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAction={handleSendSwap}
        actionType="send"
        user={user}
        loading={sending}
        error={modalError}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Skill to Offer</label>
          <select
            value={requesterSkill}
            onChange={e => setRequesterSkill(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select skill</option>
            {currentUser?.skillsOffered?.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill You Want</label>
          <select
            value={recipientSkill}
            onChange={e => setRecipientSkill(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">Select skill</option>
            {user?.skillsOffered?.map(skill => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleSendSwap}
          disabled={!requesterSkill || !recipientSkill || sending}
          className="mt-2 px-4 py-2 rounded bg-primary-600 text-white font-medium disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Send Swap Request'}
        </button>
      </SwapRequestModal>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {user.profilePhotoURL ? (
              <img
                className="h-24 w-24 rounded-full object-cover"
                src={user.profilePhotoURL}
                alt={user.name}
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-3xl font-medium text-primary-600">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            {user.location && (
              <p className="text-gray-600 flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {user.location}
              </p>
            )}
            {user.rating > 0 && (
              <div className="flex items-center mt-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900 ml-1">
                  {user.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 ml-1">
                  ({user.totalRatings} reviews)
                </span>
              </div>
            )}
            {user.bio && (
              <p className="text-gray-600 mt-3">{user.bio}</p>
            )}
          </div>

          {/* Action Button */}
          {currentUser && currentUser.id !== user.id && (
            <div className="flex-shrink-0">
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                onClick={openModal}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Swap Request
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Offered */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Offered</h2>
          {user.skillsOffered && user.skillsOffered.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills offered yet.</p>
          )}
        </div>

        {/* Skills Wanted */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills Wanted</h2>
          {user.skillsWanted && user.skillsWanted.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills wanted yet.</p>
          )}
        </div>
      </div>

      {/* Availability */}
      {user.availability && user.availability.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Availability</h2>
          <div className="flex flex-wrap gap-2">
            {user.availability.map((avail, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
              >
                <Clock className="h-4 w-4 mr-1" />
                {avail}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Member Since */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Member Since</h2>
        <p className="text-gray-600">
          {new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Feedback & Reviews */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews & Ratings</h2>
        {feedbackLoading ? (
          <div>Loading reviews...</div>
        ) : feedbackError ? (
          <div className="text-red-500 mb-2">{feedbackError}</div>
        ) : feedback.length === 0 ? (
          <div className="text-gray-400">No reviews yet.</div>
        ) : (
          <div className="space-y-4">
            {feedback.map(fb => (
              <div key={fb._id} className="border-b pb-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{fb.fromUserId?.name || 'User'}</span>
                  <span className="ml-auto">
                    <StarRating rating={fb.rating} readOnly size={5} />
                  </span>
                </div>
                <div className="text-gray-700 mb-1">{fb.comment}</div>
                <div className="text-xs text-gray-400">{new Date(fb.createdAt).toLocaleString()}</div>
                <div className="text-xs text-gray-500 italic">Skill: {fb.skillRated}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 