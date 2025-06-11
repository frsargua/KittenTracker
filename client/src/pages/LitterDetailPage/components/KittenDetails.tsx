import React from "react";
import type { Kitten, WeightRecord } from "../../../services/LitterService";
import AddWeightForm from "./AddWeightForm";
import WeightList from "./WeightList";

interface KittenDetailsProps {
  kitten: Kitten;
  weightRecords: WeightRecord[];
  onAddWeight: (kittenId: string, formData: FormData) => Promise<void>;
}

const KittenDetails: React.FC<KittenDetailsProps> = ({
  kitten,
  weightRecords,
  onAddWeight,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showAddWeightForm, setShowAddWeightForm] = React.useState(false);

  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`heading-${kitten.id}`}>
        <button
          className="accordion-button collapsed"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="fw-bold fs-5 me-2">{kitten.name}</span>
          <small className="text-muted">
            ({kitten.gender} - {kitten.color})
          </small>
        </button>
      </h2>
      <div
        id={`collapse-${kitten.id}`}
        className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
      >
        <div className="accordion-body">
          <p>{kitten.description}</p>
          <hr />
          <h6>Weight History</h6>
          <WeightList weightRecords={weightRecords} kittenName={kitten.name} />
          <button
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={() => setShowAddWeightForm(!showAddWeightForm)}
          >
            {showAddWeightForm ? "Cancel" : "Add New Weight"}
          </button>

          {showAddWeightForm && (
            <AddWeightForm
              kittenId={kitten.id}
              onAddWeight={onAddWeight}
              onCancel={() => setShowAddWeightForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KittenDetails;
