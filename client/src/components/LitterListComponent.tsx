// src/components/LitterListComponent.tsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { getUserLitters, type Litter } from "../services/LitterService";
import { Link } from "react-router-dom";

const LitterListComponent: React.FC = () => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const fetchLitters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userLitters = await getUserLitters(getAccessTokenSilently);
        setLitters(userLitters);
      } catch (err: any) {
        setError(err.message || "Failed to fetch litters.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLitters();
  }, [getAccessTokenSilently]);

  if (isLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Fetching your litters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">Error fetching litters: {error}</div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4">Your Litters</h2>
        <Link to="/create-litter" className="btn btn-primary">
          <i className="bi bi-plus-lg me-2"></i>New Litter
        </Link>
      </div>

      {litters.length === 0 ? (
        <div className="card text-center p-4 border-2 border-dashed">
          <div className="card-body">
            <h5 className="card-title">No Litters Found</h5>
            <p className="card-text text-muted">
              It looks like you haven't created any litters yet.
            </p>
            <Link to="/create-litter" className="btn btn-success">
              Create Your First Litter
            </Link>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {litters.map((litter) => (
            <div className="col" key={litter.id}>
              <div className="card h-100 shadow-sm hover-shadow-lg transition-shadow">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{litter.name}</h5>
                  <p className="card-subtitle mb-2 text-muted">
                    Born: {new Date(litter.dateOfBirth).toLocaleDateString()}
                  </p>
                  <p className="card-text flex-grow-1">
                    {litter.notes || "No notes for this litter."}
                  </p>
                  <div className="mt-auto text-end">
                    <Link
                      to={`/litters/${litter.id}`}
                      className="btn btn-outline-primary"
                    >
                      View Details
                      <i className="bi bi-arrow-right-short ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LitterListComponent;
