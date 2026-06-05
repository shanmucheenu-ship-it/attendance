import React, { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppContext } from '../context/AppContext';

// Auth
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard';

// HOD
import HodOverview from '../pages/hod/HodOverview';

// Super Admin & Faculty placeholders (we will create these)
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import ManageUsers from '../pages/superadmin/ManageUsers';
import SuperAdminManageStudents from '../pages/superadmin/ManageStudents';
import ManageStudents from '../pages/faculty/ManageStudents';
import FacultySubmitAttendance from '../pages/faculty/SubmitAttendance';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { auth } = useContext(AppContext);
  if (!auth.isLoggedIn || auth.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
      {/* Public Route */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      
      {/* Super Admin Routes */}
      <Route path="/superadmin/dashboard" element={
        <ProtectedRoute allowedRole="superadmin">
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/users" element={
        <ProtectedRoute allowedRole="superadmin">
          <ManageUsers />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/students" element={
        <ProtectedRoute allowedRole="superadmin">
          <SuperAdminManageStudents />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* HOD Routes */}
      <Route path="/hod/dashboard" element={
        <ProtectedRoute allowedRole="hod">
          <HodOverview />
        </ProtectedRoute>
      } />

      {/* Faculty Routes */}
      <Route path="/faculty/submit" element={
        <ProtectedRoute allowedRole="faculty">
          <FacultySubmitAttendance />
        </ProtectedRoute>
      } />
      <Route path="/faculty/dashboard" element={
        <Navigate to="/faculty/submit" replace />
      } />
      <Route path="/faculty/students" element={
        <ProtectedRoute allowedRole="faculty">
          <ManageStudents />
        </ProtectedRoute>
      } />
      
      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRoutes;
