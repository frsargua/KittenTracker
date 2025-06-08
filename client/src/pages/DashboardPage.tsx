import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import LitterListComponent from "../components/LitterListComponent";

const DashboardPage: React.FC = () => {
  const { user } = useAuth0();
  return (
    <div className="container mt-4">
      <div className="p-4 p-md-5 mb-4 rounded-3 bg-light border">
        <div className="container-fluid py-3">
          <h1 className="display-5 fw-bold">
            Welcome, {user?.given_name || user?.name || "Friend"}!
          </h1>
          <p className="col-md-10 fs-5">
            This is your KittenTracker dashboard. Here you can manage litters
            and track their growth.
          </p>
          <Link
            className="btn btn-primary btn-lg mt-3"
            to="/create-litter"
            role="button"
          >
            Create New Litter Group
          </Link>
        </div>
      </div>
      <LitterListComponent />
    </div>
  );
};

export default DashboardPage;
