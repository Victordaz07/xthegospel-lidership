/**
 * App Router - xTheGospel Leaders
 * 
 * Main routing configuration for the Leaders app.
 * Authentication flow:
 * 1. Login -> Select Role -> Ward Setup -> Dashboard
 */

import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Auth pages
import { LoginPage, RoleSelectionPage } from '../features/auth';

// Join + Participant live view (public / auth only - no ward/role required)
import { JoinSessionPage, SessionParticipantLiveView } from '../features/teachingSessions/pages';

// Ward pages
import { WardSetupPage } from '../features/ward';

// Protected routes
import ProtectedRoute from './ProtectedRoute';
import RoleRequiredRoute from './RoleRequiredRoute';
import WardRequiredRoute from './WardRequiredRoute';
import LeadershipCallingsRoutes from './LeadershipCallingsRoutes';
import { StorageService } from '../utils/storage';
import { FIRST_OPEN_WELCOME_KEY } from '../config/welcome';
import FirstOpenWelcome from '../components/FirstOpenWelcome';

const AppRouter: React.FC = () => {
  const location = useLocation();
  const hasSeenWelcome = StorageService.getItem(FIRST_OPEN_WELCOME_KEY) === 'true';

  if (!hasSeenWelcome && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }
  if (hasSeenWelcome && location.pathname === '/welcome') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/welcome" element={<FirstOpenWelcome />} />
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/join" element={<JoinSessionPage />} />
      <Route
        path="/session/:wardId/:sessionId/live"
        element={
          <ProtectedRoute>
            <SessionParticipantLiveView />
          </ProtectedRoute>
        }
      />
      
      {/* Role selection (requires auth but not role) */}
      <Route
        path="/select-role"
        element={
          <ProtectedRoute>
            <RoleSelectionPage />
          </ProtectedRoute>
        }
      />
      
      {/* Ward setup (requires auth + role, but not ward) */}
      <Route
        path="/ward-setup"
        element={
          <ProtectedRoute>
            <RoleRequiredRoute>
              <WardSetupPage />
            </RoleRequiredRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Protected routes - Leadership Callings module */}
      {/* Requires: Auth + Role + Ward */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleRequiredRoute>
              <WardRequiredRoute>
                <LeadershipCallingsRoutes />
              </WardRequiredRoute>
            </RoleRequiredRoute>
          </ProtectedRoute>
        }
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
