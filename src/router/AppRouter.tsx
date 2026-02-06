/**
 * App Router - xTheGospel Leaders
 * 
 * Main routing configuration for the Leaders app.
 * Includes protected routes and authentication flow.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth pages
import { LoginPage, RoleSelectionPage } from '../features/auth';

// Protected routes
import ProtectedRoute from './ProtectedRoute';
import RoleRequiredRoute from './RoleRequiredRoute';
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
      
      {/* Protected routes - Leadership Callings module */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <RoleRequiredRoute>
              <LeadershipCallingsRoutes />
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
