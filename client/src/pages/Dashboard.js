import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { 
  Search, 
  MessageSquare, 
  User, 
  Star, 
  Calendar,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState({
    totalSwaps: 0,
    pendingSwaps: 0,
    completedSwaps: 0,
    averageRating: 0
  });
  const [recentSwaps, setRecentSwaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch latest user profile
        const userRes = await axios.get('/api/auth/me');
        if (setUser) setUser(userRes.data.user); // update context if possible
        // Fetch user's swaps
        const swapsResponse = await axios.get('/api/swaps/mine?limit=5');
        setRecentSwaps(swapsResponse.data.swaps);

        // Calculate stats
        const allSwaps = swapsResponse.data.swaps;
        const totalSwaps = allSwaps.length;
        const pendingSwaps = allSwaps.filter(swap => swap.status === 'pending').length;
        const completedSwaps = allSwaps.filter(swap => swap.status === 'completed').length;

        setStats({
          totalSwaps,
          pendingSwaps,
          completedSwaps,
          averageRating: userRes.data.user.rating || 0
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAnnouncements = async () => {
      setAnnouncementsLoading(true);
      try {
        const res = await axios.get('/api/announcements');
        setAnnouncements(res.data.announcements);
      } catch (e) {
        setAnnouncements([]);
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    fetchDashboardData();
    fetchAnnouncements();
  }, []);

  const openAnnouncementsModal = async () => {
    setShowAnnouncementsModal(true);
    setAnnouncementsLoading(true);
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data.announcements);
    } catch (e) {
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const closeAnnouncementsModal = () => {
    setShowAnnouncementsModal(false);
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Floating Announcements Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-full shadow-lg p-4 flex items-center hover:bg-primary-700 focus:outline-none"
        onClick={openAnnouncementsModal}
        title="View Announcements"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <Bell className="h-6 w-6" />
        <span className="ml-2 font-medium hidden sm:inline">Announcements</span>
      </button>

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
              onClick={closeAnnouncementsModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Platform Announcements</h2>
            {announcementsLoading ? (
              <div>Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-gray-400">No announcements yet.</div>
            ) : (
              <ul className="space-y-4">
                {announcements.map(a => (
                  <li key={a._id} className="border-b pb-2">
                    <div className="font-semibold text-lg">{a.title}</div>
                    <div className="text-gray-700">{a.content}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {a.createdBy?.name ? `By ${a.createdBy.name}` : ''} {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}! 👋</h1>
        <p className="mt-2 text-primary-100">
          Ready to learn and share skills? Here's what's happening with your swaps.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Swaps</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedSwaps}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/search"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <Search className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Find Skills</h3>
                <p className="text-sm text-gray-500">Search for people to swap with</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <User className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Update Profile</h3>
                <p className="text-sm text-gray-500">Add skills and availability</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>

            <Link
              to="/swaps"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <MessageSquare className="h-8 w-8 text-primary-600" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">My Swaps</h3>
                <p className="text-sm text-gray-500">View all your swap requests</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Swaps */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Swaps</h2>
          <Link
            to="/swaps"
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            View all
          </Link>
        </div>
        <div className="p-6">
          {recentSwaps.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No swaps yet</h3>
              <p className="text-gray-500 mb-4">
                Start by searching for skills you want to learn or update your profile with skills you can teach.
              </p>
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
              {recentSwaps.map((swap) => (
                <div
                  key={swap._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
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
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(swap.status)}`}>
                      {getStatusIcon(swap.status)}
                      <span className="ml-1 capitalize">{swap.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Profile</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Skills You Offer</h3>
              {user.skillsOffered && user.skillsOffered.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {user.skillsOffered.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{user.skillsOffered.length - 5} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills added yet</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Skills You Want</h3>
              {user.skillsWanted && user.skillsWanted.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {user.skillsWanted.length > 5 && (
                    <span className="text-xs text-gray-500">
                      +{user.skillsWanted.length - 5} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills added yet</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/profile"
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Update your profile
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 