import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoadingSpinner } from './components/LoadingSpinner';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Customer Pages
import { CustomerOverview } from './pages/CustomerOverview';
import { BookServicePage } from './pages/BookServicePage';
import { CustomerAppointments } from './pages/CustomerAppointments';
import { CustomerWorkOrders } from './pages/CustomerWorkOrders';
import { CustomerScopeChanges } from './pages/CustomerScopeChanges';
import { CustomerCompletionApprovals } from './pages/CustomerCompletionApprovals';
import { CustomerDisputes } from './pages/CustomerDisputes';
import { CustomerNotifications } from './pages/CustomerNotifications';
import { CustomerProfilePage } from './pages/CustomerProfilePage';

// Provider Pages
import { ProviderOverview } from './pages/ProviderOverview';
import { ProviderBookingRequests } from './pages/ProviderBookingRequests';
import { ProviderAppointments } from './pages/ProviderAppointments';
import { ProviderWorkOrders } from './pages/ProviderWorkOrders';
import { ProviderScopeChanges } from './pages/ProviderScopeChanges';
import { ProviderCompletedJobs } from './pages/ProviderCompletedJobs';
import { ProviderReviews } from './pages/ProviderReviews';
import { ProviderProfilePage } from './pages/ProviderProfilePage';

// Admin Pages
import { AdminOverview } from './pages/AdminOverview';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminProviders } from './pages/AdminProviders';
import { AdminAppointments } from './pages/AdminAppointments';
import { AdminCategories } from './pages/AdminCategories';
import { AdminDisputes } from './pages/AdminDisputes';
import { AdminReports } from './pages/AdminReports';
import { AdminSettings } from './pages/AdminSettings';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to user's authorized home dashboard
    if (role === 'admin') return <Navigate to="/admin/overview" replace />;
    if (role === 'provider') return <Navigate to="/provider/overview" replace />;
    return <Navigate to="/customer/overview" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
      </Route>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Customer Dashboard Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/customer/overview" replace />} />
        <Route path="overview" element={<CustomerOverview />} />
        <Route path="book" element={<BookServicePage />} />
        <Route path="my-appointments" element={<CustomerAppointments />} />
        <Route path="work-orders" element={<CustomerWorkOrders />} />
        <Route path="scope-change-history" element={<CustomerScopeChanges />} />
        <Route path="completion-approvals" element={<CustomerCompletionApprovals />} />
        <Route path="disputes" element={<CustomerDisputes />} />
        <Route path="notifications" element={<CustomerNotifications />} />
        <Route path="profile" element={<CustomerProfilePage />} />
      </Route>

      {/* Provider Dashboard Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/provider/overview" replace />} />
        <Route path="overview" element={<ProviderOverview />} />
        <Route path="booking-requests" element={<ProviderBookingRequests />} />
        <Route path="my-appointments" element={<ProviderAppointments />} />
        <Route path="work-orders" element={<ProviderWorkOrders />} />
        <Route path="scope-change-requests" element={<ProviderScopeChanges />} />
        <Route path="completed-jobs" element={<ProviderCompletedJobs />} />
        <Route path="reviews" element={<ProviderReviews />} />
        <Route path="profile" element={<ProviderProfilePage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/overview" replace />} />
        <Route path="overview" element={<AdminOverview />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default App;

