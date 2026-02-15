import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import DashboardLayout from './components/DashboardLayout';
import Home from './components/Home';
import AttendancePage from './components/AttendancePage';
import { GradesPage, LibraryPage, NoticesPage } from './components/PlaceholderPages';
// 2. ADD this line to import your new component
import TimetablePage from './components/TimetablePage';
import Grades from './components/Grades';
import MakeAnnouncementPage from './components/MakeAnnouncementPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... Auth Routes ... */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Home />} />
          <Route path="attendance" element={<AttendancePage />} />
          {/* This will now use the new TimetablePage component */}
          <Route path="timetable" element={<TimetablePage />} />
          <Route path="grades" element={<Grades />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="notices" element={<NoticesPage />} />
          <Route path="make-announcement" element={<MakeAnnouncementPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;