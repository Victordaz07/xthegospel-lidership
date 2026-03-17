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

// Import profile page
import { ProfilePage } from '../features/auth';

// Import teaching sessions
import {
  TeachingSessionsListPage,
  SessionCreatePage,
  SessionDetailPage,
  SessionLivePage,
  SessionReportPage,
  BishopTeachingDashboard,
  TeachingAnalyticsPage,
} from '../features/teachingSessions/pages';
import BaptismPreparationViewPage from '../features/baptismPreparation/pages/BaptismPreparationViewPage';
import BishopricRequiredRoute from './BishopricRequiredRoute';

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
        
        {/* Teaching Sessions */}
        <Route path="teaching" element={<TeachingSessionsListPage />} />
        <Route path="teaching/new" element={<SessionCreatePage />} />
        <Route path="teaching/:sessionId" element={<SessionDetailPage />} />
        <Route path="teaching/:sessionId/live" element={<SessionLivePage />} />
        <Route path="teaching/:sessionId/report" element={<SessionReportPage />} />
        
        {/* Bishopric - Teaching oversight */}
        <Route path="bishop/teaching" element={<BishopricRequiredRoute><BishopTeachingDashboard /></BishopricRequiredRoute>} />
        <Route path="bishop/teaching/analytics" element={<BishopricRequiredRoute><TeachingAnalyticsPage /></BishopricRequiredRoute>} />
        <Route path="bishop/teaching/:sessionId/report" element={<BishopricRequiredRoute><SessionReportPage /></BishopricRequiredRoute>} />
        
        {/* Members */}
        <Route path="members" element={<LeadershipMembersPage />} />
        <Route path="members/:id/baptism-preparation" element={<BaptismPreparationViewPage />} />
        <Route path="members/:id" element={<MemberOverviewPage />} />
        
        {/* Calendar */}
        <Route path="calendar" element={<LeadershipCalendarPage />} />
        
        {/* Hubs */}
        <Route path="responsibilities" element={<ResponsibilitiesHubPage />} />
        <Route path="notes" element={<NotesHubPage />} />
        
        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </LeadershipCallingsLayout>
  );
};

export default LeadershipCallingsRoutes;
