import { Routes, Route } from 'react-router-dom';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import React, { Suspense, lazy } from 'react';

const LandingPage = lazy(() => import('../pages/Landing'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UploadPage = lazy(() => import('../pages/Upload'));
const TripDetails = lazy(() => import('../pages/TripDetails'));
const PublicTripDetails = lazy(() => import('../pages/TripDetails/public'));
const Profile = lazy(() => import('../pages/Profile'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Auth0 Protected Route wrapper component
const ProtectedRoute = ({ component }: { component: React.ComponentType }) => {
  const Component = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-450 font-medium text-sm animate-pulse">Redirecting you to login portal...</p>
        </div>
      </div>
    ),
  });
  return <Component />;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/share/:id" element={<PublicTripDetails />} />

        {/* Authenticated Dashboard Pages */}
        <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
        <Route path="/upload" element={<ProtectedRoute component={UploadPage} />} />
        <Route path="/trip/:id" element={<ProtectedRoute component={TripDetails} />} />
        <Route path="/profile" element={<ProtectedRoute component={Profile} />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
