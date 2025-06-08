// src/pages/AuthenticatedLandingPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import LitterListComponent from "../components/LitterListComponent";
import { useAuth0 } from "@auth0/auth0-react";

const AuthenticatedLandingPage: React.FC = () => {
  const { user } = useAuth0();

  return (
    <div className="container mt-4">
      <div className="p-5 mb-4 bg-light rounded-3">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="col-md-8 fs-4">
            Manage your kitten litters, track their growth, and keep all their
            precious moments recorded.
          </p>
          <Link
            className="btn btn-primary btn-lg"
            to="/create-litter"
            role="button"
          >
            <i className="bi bi-plus-circle-fill me-2"></i> Create New Litter
          </Link>
        </div>
      </div>

      <LitterListComponent />
    </div>
  );
};

export default AuthenticatedLandingPage;
