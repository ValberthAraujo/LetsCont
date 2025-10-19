import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ children, requireAuth = true, requireSuperuser = false, redirectTo = '/admin' }) {
  const { isAuthenticated, isSuperuser } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  if (requireSuperuser && !isSuperuser) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  return children;
}

