import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export const ProtectedRoute = ({ role, children }) => {
  const { currentUser } = useAuth();

  // If no user is logged in, redirect to the specific role's login page
  if (!currentUser) {
    return <Navigate to={`/login/${role}`} replace />;
  }

  // If logged in but wrong role, redirect to their actual role page
  if (currentUser.role !== role) {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  return children;
};
