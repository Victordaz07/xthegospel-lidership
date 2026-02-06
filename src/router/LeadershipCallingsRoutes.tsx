/**
 * Leadership Callings Routes
 * 
 * Routes for ward/stake leadership - callings management.
 * NO gamification, NO surveillance.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import layout
import LeadershipCallingsLayout from '../layouts/LeadershipCallingsLayout';

// Import pages from the leadershipCallings module
import {
  LeadershipDashboardPage,
  LeadershipCallingsPage,
  NewCallingPage,
  CallingDetailPage,
  LeadershipMembersPage,
  MemberOverviewPage,
  LeadershipCalendarPage,
  ResponsibilitiesHubPage,
  NotesHubPage,
} from '../features/leadershipCallings/pages';

// Import CSS
import '../features/leadershipCallings/pages/LeadershipPages.css';

const LeadershipCallingsRoutes: React.FC = () => {
  return (
    <LeadershipCallingsLayout>
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<LeadershipDashboardPage />} />
        
        {/* Callings */}
        <Route path="callings" element={<LeadershipCallingsPage />} />
        <Route path="callings/new" element={<NewCallingPage />} />
        <Route path="callings/:id" element={<CallingDetailPage />} />
        
        {/* Members */}
        <Route path="members" element={<LeadershipMembersPage />} />
        <Route path="members/:id" element={<MemberOverviewPage />} />
        
        {/* Calendar */}
        <Route path="calendar" element={<LeadershipCalendarPage />} />
        
        {/* Hubs */}
        <Route path="responsibilities" element={<ResponsibilitiesHubPage />} />
        <Route path="notes" element={<NotesHubPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<div>Perfil del Líder</div>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LeadershipCallingsLayout>
  );
};

export default LeadershipCallingsRoutes;
