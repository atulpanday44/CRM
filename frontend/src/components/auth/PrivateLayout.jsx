import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';

/**
 * Wraps the app layout for authenticated users.
 * Redirects to /login if not logged in.
 */
const PrivateLayout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout user={user}>
      <Outlet />
    </Layout>
  );
};

export default PrivateLayout;
