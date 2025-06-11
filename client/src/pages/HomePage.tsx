import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

/**
 * The public landing page for unauthenticated users.
 * Redirects to the dashboard if the user is already logged in.
 */

const HomePage: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container text-center mt-5">
      <h1>Welcome to KittenTracker!</h1>
      <p>Please log in to manage your litters.</p>
      <button
        className="btn btn-primary btn-lg"
        onClick={() => loginWithRedirect()}
      >
        Log In
      </button>
    </div>
  );
};

export default HomePage;
