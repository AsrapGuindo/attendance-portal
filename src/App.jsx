/* src/App.jsx */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Attendance from './pages/Attendance';
import Students from './pages/Students';
import Reports from './pages/Reports';
// Management Pages
import Announcements from './pages/management/Announcements';
import Departments from './pages/management/Departments';
import EventPenalties from './pages/management/EventPenalties';
import Geofence from './pages/management/Geofence';
import GradeLevels from './pages/management/GradeLevels';
import SchoolEvents from './pages/management/SchoolEvents';
import Sections from './pages/management/Sections';
import MissedEvents from './pages/management/MissedEvents';
import Feedback from './pages/management/Feedback';
import AuditLogs from './pages/management/AuditLogs';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('admin_auth') === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('admin_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="students" element={<Students />} />
          <Route path="reports" element={<Reports />} />
          
          {/* Management Routes */}
          <Route path="manage/announcements" element={<Announcements />} />
          <Route path="manage/departments" element={<Departments />} />
          <Route path="manage/penalties" element={<EventPenalties />} />
          <Route path="manage/geofence" element={<Geofence />} />
          <Route path="manage/gradelevels" element={<GradeLevels />} />
          <Route path="manage/events" element={<SchoolEvents />} />
          <Route path="manage/sections" element={<Sections />} />
          <Route path="manage/missed-events" element={<MissedEvents />} />
          <Route path="manage/feedback" element={<Feedback />} />
          <Route path="manage/audit-logs" element={<AuditLogs />} />
          
          {/* Redirect any unknown route to dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}