import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }) => {
  const { status } = useSelector((state) => state.auth);

  if (!status) {
    return <Navigate to="/auth/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
