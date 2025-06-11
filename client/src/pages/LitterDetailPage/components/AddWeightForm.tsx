import React, { useState } from "react";

interface AddWeightFormProps {
  kittenId: string;
  onAddWeight: (kittenId: string, formData: FormData) => Promise<void>;
  onCancel: () => void;
}

interface NewWeightFormData {
  dateRecorded: string;
  weightInGrams: string;
  notes: string;
  photo?: File | null;
}

const AddWeightForm: React.FC<AddWeightFormProps> = ({
  kittenId,
  onAddWeight,
  onCancel,
}) => {
  const [newWeight, setNewWeight] = useState<NewWeightFormData>({
    dateRecorded: new Date().toISOString().split("T")[0],
    weightInGrams: "",
    notes: "",
    photo: null,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "photo" && files) {
      setNewWeight({ ...newWeight, photo: files[0] });
    } else {
      setNewWeight({ ...newWeight, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !newWeight.dateRecorded ||
      !newWeight.weightInGrams.trim() ||
      parseFloat(newWeight.weightInGrams) <= 0
    ) {
      setError("Valid date and positive weight are required.");
      return;
    }

    const formData = new FormData();
    formData.append("dateRecorded", newWeight.dateRecorded);
    formData.append("weightInGrams", newWeight.weightInGrams);
    formData.append("notes", newWeight.notes);
    if (newWeight.photo) {
      formData.append("photo", newWeight.photo);
    }

    setError(null);
    try {
      await onAddWeight(kittenId, formData);
      onCancel(); // Close form on success
    } catch (err: any) {
      setError(err.message || "Failed to add weight record.");
    }
  };

  return (
    <div className="card p-3 mt-3 bg-light border">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-2">
            <label htmlFor={`weightDate-${kittenId}`} className="form-label">
              Date*
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              id={`weightDate-${kittenId}`}
              name="dateRecorded"
              value={newWeight.dateRecorded}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-2">
            <label htmlFor={`weightGrams-${kittenId}`} className="form-label">
              Weight (grams)*
            </label>
            <input
              type="number"
              step="0.1"
              className="form-control form-control-sm"
              id={`weightGrams-${kittenId}`}
              name="weightInGrams"
              value={newWeight.weightInGrams}
              onChange={handleChange}
              placeholder="e.g., 120.5"
              required
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">
            Kitten Photo (Optional)
          </label>
          <input
            type="file"
            className="form-control"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handleChange}
          />
        </div>

        <div className="mb-2">
          <label htmlFor={`weightNotes-${kittenId}`} className="form-label">
            Notes
          </label>
          <textarea
            className="form-control form-control-sm"
            id={`weightNotes-${kittenId}`}
            name="notes"
            rows={2}
            value={newWeight.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        <button type="submit" className="btn btn-primary me-2">
          Save Weight
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddWeightForm;
