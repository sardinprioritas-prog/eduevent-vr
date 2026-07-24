import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export const ProtectedRoute = ({ role, allowedRoles, children }) => {
  const { currentUser } = useAuth();

  // If no user is logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to={`/login/${role || 'admin'}`} replace />;
  }

  // If allowedRoles array is provided, check if user's role is included
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(currentUser.role)) {
      return <Navigate to={`/${currentUser.role}`} replace />;
    }
    return children;
  }

  // If logged in but wrong role, redirect to their actual role page
  if (role && currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  return children;
};

