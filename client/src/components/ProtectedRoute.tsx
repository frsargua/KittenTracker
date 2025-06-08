// src/components/ProtectedRoute.tsx
import React, { type ComponentType } from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

interface ProtectedRouteProps {
  component: ComponentType<object>; // The component to render if authenticated
  // You can add other props here that your component might need
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component,
  ...args
}) => {
  const Component = withAuthenticationRequired(component, {
    // This function is called when the user is redirected to Auth0 for login.
    // It saves the current app state (like the path they were trying to access)
    // so they can be redirected back after successful login.
    onRedirecting: () => (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    ), // Or a spinner component
    // Optional: arguments to pass to the wrapped component
    // returnTo: () => window.location.pathname,
  });
  return <Component {...args} />;
};

export default ProtectedRoute;
