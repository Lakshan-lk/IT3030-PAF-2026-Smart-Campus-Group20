import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import AdminCreateUserPage from './pages/AdminCreateUserPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminStaffPage from './pages/AdminStaffPage';
import { useAuth } from './context/AuthContext';

const RequireAuth = ({ allowedRoles }) => {
  const { authUser } = useAuth();
  const location = useLocation();

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(authUser.role)) {
    const redirectPath = authUser.role === 'admin' ? '/admin/overview' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

const RoleHomeRedirect = () => {
  const { authUser } = useAuth();
  if (!authUser) {
    return <Navigate to="/login" replace />;
  }
  return authUser.role === 'admin'
    ? <Navigate to="/admin/overview" replace />
    : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth allowedRoles={['user']} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/overview" element={<AdminOverviewPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/resources" element={<AdminResourcesPage />} />
            <Route path="/admin/users/create" element={<AdminCreateUserPage />} />
            <Route path="/admin/users/students" element={<AdminStudentsPage />} />
            <Route path="/admin/users/staff" element={<AdminStaffPage />} />
            <Route path="/admin/users" element={<Navigate to="/admin/users/create" replace />} />
            <Route path="/admin" element={<AdminOverviewPage />} />
          </Route>
        </Route>

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;
