import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import TechnicianLayout from './layouts/TechnicianLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';
import AdminOverviewPage from './pages/AdminOverviewPage';
import AdminBookingsPage from './pages/AdminBookingsPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminEquipmentPage from './pages/AdminEquipmentPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import TechnicianTicketsPage from './pages/TechnicianTicketsPage';
import { useAuth } from './context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { authUser } = useAuth();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    if (authUser.role === 'admin') return <Navigate to="/admin/overview" replace />;
    if (authUser.role === 'technician') return <Navigate to="/technician/tickets" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const RoleHomeRedirect = () => {
  const { authUser } = useAuth();
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  if (authUser.role === 'admin') return <Navigate to="/admin/overview" replace />;
  if (authUser.role === 'technician') return <Navigate to="/technician/tickets" replace />;
  return <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Standard user routes */}
        <Route element={<RequireAuth allowedRoles={['user']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/overview" element={<AdminOverviewPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
            <Route path="/admin/equipment" element={<AdminEquipmentPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin" element={<AdminOverviewPage />} />
          </Route>
        </Route>

        {/* Technician routes */}
        <Route element={<RequireAuth allowedRoles={['technician']} />}>
          <Route element={<TechnicianLayout />}>
            <Route path="/technician/tickets" element={<TechnicianTicketsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
