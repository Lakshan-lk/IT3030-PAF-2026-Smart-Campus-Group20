import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminResourcesPage from './pages/AdminResourcesPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="/admin/overview" element={<AdminOverviewPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
          <Route path="/admin/resources" element={<AdminResourcesPage />} />
          <Route path="/admin" element={<AdminOverviewPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
