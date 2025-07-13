import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import MySwaps from './pages/MySwaps';
//import AdminDashboard from './pages/AdminDashboard';
import LoadingSpinner from './components/LoadingSpinner';

import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import SwapModeration from './pages/Admin/SwapModeration';
import Announcements from './pages/Announcements';
import ReportsDashboard from './pages/Admin/ReportsDashboard';


// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading, user, isAuthenticated } = useAuth();

  // Helper: is super admin
  const isSuperAdmin = user?.email === 'p@p.com';

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        {!isSuperAdmin && <Route path="/" element={<Home />} />}
        {!isSuperAdmin && <Route path="/login" element={<Login />} />}
        {!isSuperAdmin && <Route path="/register" element={<Register />} />}
        {!isSuperAdmin && <Route path="/search" element={<Search />} />}
        {!isSuperAdmin && <Route path="/user/:id" element={<UserProfile />} />}
        {!isSuperAdmin && <Route path="/announcements" element={<Announcements />} />}

        {/* Protected User Routes (block for p@p.com) */}
        {!isSuperAdmin && (
          <>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/swaps"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MySwaps />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </>
        )}

        {/* Admin Routes: Only allow for p@p.com or admin users */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Redirect /admin to /admin/announcements for p@p.com */}
          <Route
            index
            element={isSuperAdmin ? <Navigate to="/admin/announcements" replace /> : <AdminDashboard />}
          />
          <Route path="manage-users" element={<ManageUsers />} />
          <Route path="swap-moderation" element={<SwapModeration />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports-dashboard" element={<ReportsDashboard />} />
        </Route>

        {/* Redirect p@p.com to admin if they try to access any other route */}
        {isSuperAdmin && <Route path="*" element={<Navigate to="/admin/announcements" replace />} />}
        {/* Catch all route for others */}
        {!isSuperAdmin && <Route path="*" element={<Navigate to="/" replace />} />}
      </Routes>
    </div>
  );
}

export default App; 