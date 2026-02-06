/**
 * App Router - xTheGospel Leaders
 * 
 * Main routing configuration for the Leaders app.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import routes
import LeadershipCallingsRoutes from './LeadershipCallingsRoutes';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Main routes - Leadership Callings module */}
      <Route path="/*" element={<LeadershipCallingsRoutes />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;
