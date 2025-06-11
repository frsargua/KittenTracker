import React from "react";
import type { WeightRecord } from "../../../services/LitterService";

interface WeightListProps {
  weightRecords: WeightRecord[];
  kittenName: string;
}

const WeightList: React.FC<WeightListProps> = ({
  weightRecords,
  kittenName,
}) => {
  if (weightRecords.length === 0) {
    return <p className="text-muted">No weight records yet.</p>;
  }

  return (
    <table className="table table-striped table-sm">
      <thead>
        <tr>
          <th>Date</th>
          <th>Weight (g)</th>
          <th>Photo</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {weightRecords.map((record) => (
          <tr key={record.id}>
            <td>{new Date(record.dateRecorded).toLocaleDateString()}</td>
            <td>{record.weightInGrams}g</td>
            <td>
              {record.photoUrl && (
                <a
                  href={record.photoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={record.photoUrl}
                    alt={`Weight record for ${kittenName}`}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </a>
              )}
            </td>
            <td>{record.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default WeightList;
