import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Star, CheckCircle, XCircle, Clock, Calendar, ArrowRight } from 'lucide-react';
import Feedback from './Feedback';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'accepted':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'rejected':
    case 'cancelled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'accepted':
      return <Calendar className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const MySwaps = () => {
  const { user } = useAuth();
  const [swaps, setSwaps] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSwap, setFeedbackSwap] = useState(null);
  const [feedbackToUser, setFeedbackToUser] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({}); // { swapId: true }

  useEffect(() => {
    const fetchSwaps = async () => {
      setLoading(true);
      try {
        const params = status ? `?status=${status}` : '';
        const response = await axios.get(`/api/swaps/mine${params}`);
        setSwaps(response.data.swaps);
      } catch (error) {
        console.error('Error fetching swaps:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSwaps();
  }, [status]);

  // Fetch feedback given by this user for completed swaps
  useEffect(() => {
    const fetchFeedbackGiven = async () => {
      try {
        const res = await axios.get('/api/feedback/my-given');
        const map = {};
        res.data.feedback.forEach(fb => {
          map[fb.swapRequestId] = true;
        });
        setFeedbackGiven(map);
      } catch (e) {}
    };
    fetchFeedbackGiven();
  }, []);

  // Action handlers (accept/reject/cancel/complete)
  const handleAction = async (swapId, action) => {
    try {
      setLoading(true);
      let url = `/api/swaps/${swapId}`;
      if (action === 'accept') url += '/accept';
      if (action === 'reject') url += '/reject';
      if (action === 'cancel') url += '/cancel';
      if (action === 'complete') url += '/complete';
      await axios.put(url);
      // Refresh swaps
      const params = status ? `?status=${status}` : '';
      const response = await axios.get(`/api/swaps/mine${params}`);
      setSwaps(response.data.swaps);
    } catch (error) {
      console.error('Swap action error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openFeedbackModal = (swap, toUser) => {
    // Ensure toUser is always the other user in the swap, and has a valid _id
    let feedbackUser = toUser;
    if (!feedbackUser || !feedbackUser._id) {
      // Fallback: use swap.recipientId or swap.requesterId
      if (swap.isRequester) {
        feedbackUser = swap.recipientId || swap.otherUser;
      } else {
        feedbackUser = swap.requesterId || swap.otherUser;
      }
    }
    setFeedbackSwap(swap);
    setFeedbackToUser(feedbackUser);
    setShowFeedbackModal(true);
  };
  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackSwap(null);
    setFeedbackToUser(null);
  };
  const handleSubmitFeedback = async (rating, comment) => {
    if (!feedbackSwap || !feedbackToUser) return;
    if (!feedbackToUser._id || typeof feedbackToUser._id !== 'string') {
      alert('Could not determine the user to rate.');
      return;
    }
    // Determine which skill was received by the current user
    let skillRated = '';
    if (feedbackSwap.isRequester) {
      skillRated = feedbackSwap.recipientSkill;
    } else {
      skillRated = feedbackSwap.requesterSkill;
    }
    if (!skillRated) {
      alert('Could not determine which skill to rate.');
      return;
    }
    try {
      await axios.post('/api/feedback', {
        swapRequestId: feedbackSwap._id,
        toUserId: feedbackToUser._id,
        rating,
        comment,
        skillRated
      });
      setFeedbackGiven(prev => ({ ...prev, [feedbackSwap._id]: true }));
      closeFeedbackModal();
      // Refresh swaps
      const params = status ? `?status=${status}` : '';
      const response = await axios.get(`/api/swaps/mine${params}`);
      setSwaps(response.data.swaps);
    } catch (e) {
      const msg = e.response?.data?.message ||
        (e.response?.data && JSON.stringify(e.response.data)) ||
        'Failed to submit feedback';
      if (e.response?.data?.errors) {
        alert(msg + '\n' + e.response.data.errors.map(err => err.msg).join('\n'));
      } else {
        alert(msg);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Swaps</h1>
        <div>
          <label htmlFor="status" className="mr-2 text-sm font-medium text-gray-700">Filter by status:</label>
          <select
            id="status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : swaps.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps found</h3>
          <p className="text-gray-500 mb-4">You have no swap requests in this category.</p>
          <Link
            to="/search"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Find Skills
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {swaps.map(swap => (
            <div key={swap._id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-600">
                      {swap.otherUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {swap.isRequester ? 'You' : swap.otherUser.name} → {swap.isRequester ? swap.otherUser.name : 'You'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {swap.isRequester ? swap.requesterSkill : swap.recipientSkill} ↔ {swap.isRequester ? swap.recipientSkill : swap.requesterSkill}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(swap.status)}`}>
                    {getStatusIcon(swap.status)}
                    <span className="ml-1 capitalize">{swap.status}</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 md:items-end">
                {/* Actions based on status and role */}
                {swap.status === 'pending' && swap.isRequester && (
                  <button
                    onClick={() => handleAction(swap._id, 'cancel')}
                    className="btn btn-danger"
                  >
                    Cancel
                  </button>
                )}
                {swap.status === 'pending' && !swap.isRequester && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(swap._id, 'accept')}
                      className="btn btn-success"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(swap._id, 'reject')}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {swap.status === 'accepted' && (
                  <button
                    onClick={() => handleAction(swap._id, 'complete')}
                    className="btn btn-primary"
                  >
                    Mark as Completed
                  </button>
                )}
                {/* Feedback button for completed swaps could go here */}
                {swap.status === 'completed' && !feedbackGiven[swap._id] && (
                  <button
                    className="btn btn-primary mt-2"
                    onClick={() => openFeedbackModal(swap, swap.isRequester ? swap.otherUser : user)}
                  >
                    Leave Feedback
                  </button>
                )}
                <Link
                  to={`/user/${swap.otherUser._id}`}
                  className="btn btn-secondary mt-2"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeFeedbackModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Leave Feedback</h2>
            <FeedbackForm onSubmit={handleSubmitFeedback} onCancel={closeFeedbackModal} />
          </div>
        </div>
      )}
    </div>
  );
};

// FeedbackForm component
function FeedbackForm({ onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (rating) onSubmit(rating, comment);
      }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">Rating:</span>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            type="button"
            key={star}
            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => setRating(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Leave a comment (optional)"
        className="mb-2 px-3 py-2 border rounded w-full"
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={!rating}>Submit</button>
      </div>
    </form>
  );
}

export default MySwaps; 