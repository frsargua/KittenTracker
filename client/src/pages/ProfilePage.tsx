// src/pages/ProfilePage.tsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const ProfilePage: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth0();

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white text-center">
              <h2>User Profile</h2>
            </div>
            <div className="card-body text-center">
              <img
                src={user.picture || ""}
                alt={user.name || "P"}
                className="img-fluid rounded-circle mb-3 shadow"
                style={{ width: "150px", height: "150px" }}
              />
              <h3>{user.name}</h3>
              <p className="text-muted">{user.email}</p>
            </div>
          </div>
          <div className="card shadow-sm mt-4">
            <div className="card-header">
              <h5>Full User Data</h5>
            </div>
            <div className="card-body">
              <pre className="bg-light p-3 rounded">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
