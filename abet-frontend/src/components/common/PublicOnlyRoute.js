import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is already logged in, redirect to dashboard
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise, show the requested page (login/register)
  return children;
};

export default PublicOnlyRoute;
