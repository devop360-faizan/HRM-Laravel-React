import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leaves from './pages/Leaves';
import Employees from './pages/Employees';
import Designations from './pages/Designations';
import Attendance from './pages/Attendance';
import Holidays from './pages/Holidays';
import LeaveTypes from './pages/LeaveTypes';
import Profile from './pages/Profile';
import Departments from './pages/Departments';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return children;
};

export default function App() {
  const token = localStorage.getItem('token');
  return (
    <Routes>
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
      <Route path="/leaves" element={<ProtectedRoute><Leaves /></ProtectedRoute>} />
      <Route path="/holidays" element={<ProtectedRoute><Holidays /></ProtectedRoute>} />
      
      {/* Admin Protected Routes */}
      <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
      <Route path="/departments" element={<AdminRoute><Departments /></AdminRoute>} />
      <Route path="/designations" element={<AdminRoute><Designations /></AdminRoute>} />
      <Route path="/leave-types" element={<AdminRoute><LeaveTypes /></AdminRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
