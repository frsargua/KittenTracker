import React from "react";
import type {
  Kitten,
  WeightRecord,
  KittenCreationData,
} from "../../../services/LitterService";
import KittenDetails from "./KittenDetails";
import AddKittenForm from "./AddKittenForm";

interface KittenListProps {
  kittens: Kitten[];
  allWeightRecords: { [kittenId: string]: WeightRecord[] };
  onAddKitten: (kittenData: KittenCreationData) => Promise<void>;
  onAddWeight: (kittenId: string, formData: FormData) => Promise<void>;
}

const KittenList: React.FC<KittenListProps> = ({
  kittens,
  allWeightRecords,
  onAddKitten,
  onAddWeight,
}) => {
  const [showAddKittenForm, setShowAddKittenForm] = React.useState(false);

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header bg-light d-flex justify-content-between align-items-center">
        <h4 className="h5 mb-0">Kittens</h4>
        <button
          className="btn btn-success btn-sm"
          onClick={() => setShowAddKittenForm(!showAddKittenForm)}
        >
          {showAddKittenForm ? "Cancel" : "Add Kitten"}
        </button>
      </div>
      <div className="card-body">
        {showAddKittenForm && (
          <AddKittenForm
            onAddKitten={onAddKitten}
            onCancel={() => setShowAddKittenForm(false)}
          />
        )}

        {kittens.length > 0 ? (
          <div className="accordion" id="kittenAccordion">
            {kittens.map((kitten) => (
              <KittenDetails
                key={kitten.id}
                kitten={kitten}
                weightRecords={allWeightRecords[kitten.id] || []}
                onAddWeight={onAddWeight}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">
            No kittens in this litter yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default KittenList;
