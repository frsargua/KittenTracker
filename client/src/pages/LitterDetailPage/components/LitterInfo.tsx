import React from "react";
import type { LitterDetail } from "../../../services/LitterService";

interface LitterInfoProps {
  litter: LitterDetail;
}

const LitterInfo: React.FC<LitterInfoProps> = ({ litter }) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0">{litter.name}</h2>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => alert("Edit functionality not yet implemented.")}
        >
          Edit Litter
        </button>
      </div>
      <div className="card-body">
        <p>
          <strong>Date of Birth:</strong>{" "}
          {new Date(litter.dateOfBirth).toLocaleDateString()}
        </p>
        <p>
          <strong>Mother:</strong> {litter.motherName || "Unknown"}
        </p>
        <p>
          <strong>Breed:</strong> {litter.breed || "Not specified"}
        </p>
        {litter.notes && (
          <p>
            <strong>Notes:</strong> {litter.notes}
          </p>
        )}
      </div>
    </div>
  );
};

export default LitterInfo;
