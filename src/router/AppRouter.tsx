/**
 * App Router - xTheGospel Leaders
 * 
 * Main routing configuration for the Leaders app.
 * Authentication flow:
 * 1. Login -> Select Role -> Ward Setup -> Dashboard
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import { LoginPage, RoleSelectionPage } from '../features/auth';

// Ward pages
import { WardSetupPage } from '../features/ward';

// Protected routes
import ProtectedRoute from './ProtectedRoute';
import RoleRequiredRoute from './RoleRequiredRoute';
import WardRequiredRoute from './WardRequiredRoute';
import LeadershipCallingsRoutes from './LeadershipCallingsRoutes';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
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
