/**
 * Ward Required Route Component
 * 
 * Ensures user is a member of a ward.
 * Redirects to ward setup if not connected to a ward.
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWardStore } from '../state/ward/useWardStore';

interface WardRequiredRouteProps {
  children: React.ReactNode;
}

const WardRequiredRoute: React.FC<WardRequiredRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const { isWardMember, isLoading, loadWardMembership } = useWardStore();
  const location = useLocation();

  // Load ward membership when user is available
  useEffect(() => {
    if (user && !isWardMember) {
      loadWardMembership(user.uid);
    }
  }, [user, isWardMember, loadWardMembership]);

  // Show loading while checking
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1F3A5F 0%, #162541 100%)',
        color: 'white',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', opacity: 0.8 }}>Verificando barrio...</div>
      </div>
    );
  }

  // If not a ward member, redirect to setup
  if (!isWardMember) {
    return <Navigate to="/ward-setup" state={{ from: location }} replace />;
  }

  // User is a ward member, render the protected content
  return <>{children}</>;
};

export default WardRequiredRoute;
