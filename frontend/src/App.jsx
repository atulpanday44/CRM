import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Finance from './pages/Finance';
import HR from './pages/HR';
import Sales from './pages/Sales';
import TechSupport from './pages/TechSupport';
import Admin from './pages/Admin';
import LeaveApplication from './pages/LeaveApplication';
import LeaveRequests from './pages/LeaveRequests';

import UserManagement from './components/admin/UserManagement';
import LeaveManagement from './components/leave/LeaveManagement';
import LeaveNotification from './components/leave/LeaveNotification';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PrivateLayout from './components/auth/PrivateLayout';
import { useAuth } from './context/AuthContext';
import { LeaveProvider } from './context/LeaveContext';

const App = () => {
  const { user } = useAuth();

  return (
    <LeaveProvider>
      {user?.role === 'user' && <LeaveNotification userId={user.id} />}

      <Routes>
        {/* Root: send to hub if logged in, else landing */}
        <Route
          path="/"
          element={
            <Navigate to={user ? '/home' : '/landingpage'} replace />
          }
        />

        {/* Public routes */}
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* All app routes inside shared layout (sidebar + header); requires login */}
        <Route element={<PrivateLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="meetings" element={<Meetings />} />
          <Route
            path="finance"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'finance']} user={user}>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="hr"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'hr']} user={user}>
                <HR />
              </ProtectedRoute>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'sales']} user={user}>
                <Sales />
              </ProtectedRoute>
            }
          />
          <Route
            path="techsupport"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'tech_support']} user={user}>
                <TechSupport />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin']} user={user}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="apply-leave" element={<LeaveApplication />} />
          <Route path="leaves" element={<LeaveRequests />} />
          <Route
            path="leave-management"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'hr']} user={user}>
                <LeaveManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="user-management"
            element={
              <ProtectedRoute allowedRoles={['admin', 'superadmin', 'hr']} user={user}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </LeaveProvider>
  );
};

export default App;
