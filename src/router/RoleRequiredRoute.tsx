/**
 * Role Required Route Component
 * 
 * Ensures user has selected a leadership role.
 * Redirects to role selection if no role is set.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRoleStore } from '../state/user/useUserRoleStore';

interface RoleRequiredRouteProps {
  children: React.ReactNode;
}

const RoleRequiredRoute: React.FC<RoleRequiredRouteProps> = ({ children }) => {
  const { isRoleSelected } = useUserRoleStore();
  const location = useLocation();

  // If no role selected, redirect to role selection
  if (!isRoleSelected) {
    return <Navigate to="/select-role" state={{ from: location }} replace />;
  }

  // User has a role, render the protected content
  return <>{children}</>;
};

export default RoleRequiredRoute;
