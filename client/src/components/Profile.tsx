import React from "react";
import { useAuth0, User } from "@auth0/auth0-react"; // Import User type

const Profile: React.FC = () => {
  // Explicitly type `user` if needed, though often inferred correctly
  const { user, isAuthenticated, isLoading } = useAuth0<User>();

  if (isLoading) {
    return <div>Loading ...</div>;
  }

  return (
    isAuthenticated &&
    user && ( // Ensure user object exists
      <div>
        {user.picture && (
          <img src={user.picture} alt={user.name || "User profile"} />
        )}
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        {/* Uncomment to see all user properties */}
        {/* <pre>{JSON.stringify(user, null, 2)}</pre> */}
      </div>
    )
  );
};

export default Profile;
