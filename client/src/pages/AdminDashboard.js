import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, BarChart3, Megaphone } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage users, swaps, announcements, and view platform reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/manage-users"
          className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-primary-50 transition-colors"
        >
          <Users className="h-8 w-8 text-primary-600 mb-2" />
          <span className="text-lg font-medium text-gray-900">Manage Users</span>
          <span className="text-sm text-gray-500 mt-1">Ban/unban, roles, search</span>
        </Link>
        <Link
          to="/admin/swap-moderation"
          className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-primary-50 transition-colors"
        >
          <MessageSquare className="h-8 w-8 text-primary-600 mb-2" />
          <span className="text-lg font-medium text-gray-900">Swap Moderation</span>
          <span className="text-sm text-gray-500 mt-1">View, delete, moderate swaps</span>
        </Link>
        <Link
          to="/admin/announcements"
          className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-primary-50 transition-colors"
        >
          <Megaphone className="h-8 w-8 text-primary-600 mb-2" />
          <span className="text-lg font-medium text-gray-900">Announcements</span>
          <span className="text-sm text-gray-500 mt-1">Post platform updates</span>
        </Link>
        <Link
          to="/admin/reports-dashboard"
          className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:bg-primary-50 transition-colors"
        >
          <BarChart3 className="h-8 w-8 text-primary-600 mb-2" />
          <span className="text-lg font-medium text-gray-900">Reports</span>
          <span className="text-sm text-gray-500 mt-1">Activity, feedback, stats</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 