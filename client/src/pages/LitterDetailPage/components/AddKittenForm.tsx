import React, { useState } from "react";
import type { KittenCreationData } from "../../../services/LitterService";

interface AddKittenFormProps {
  onAddKitten: (kittenData: KittenCreationData) => Promise<void>;
  onCancel: () => void;
}

const AddKittenForm: React.FC<AddKittenFormProps> = ({
  onAddKitten,
  onCancel,
}) => {
  const [newKitten, setNewKitten] = useState<KittenCreationData>({
    name: "",
    gender: "",
    color: "",
    description: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewKitten({ ...newKitten, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newKitten.name.trim()) {
      setError("Kitten name is required.");
      return;
    }
    setError(null);
    try {
      await onAddKitten(newKitten);
      onCancel(); // Close form on success
    } catch (err: any) {
      setError(err.message || "Failed to add kitten.");
    }
  };

  return (
    <div className="card p-3 mb-4 bg-light border">
      <h5>Add a New Kitten</h5>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="kittenName" className="form-label">
            Name*
          </label>
          <input
            type="text"
            className="form-control"
            id="kittenName"
            name="name"
            value={newKitten.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="kittenGender" className="form-label">
              Gender
            </label>
            <input
              type="text"
              className="form-control"
              id="kittenGender"
              name="gender"
              value={newKitten.gender}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="kittenColor" className="form-label">
              Color/Markings
            </label>
            <input
              type="text"
              className="form-control"
              id="kittenColor"
              name="color"
              value={newKitten.color}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="kittenDescription" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="kittenDescription"
            name="description"
            rows={2}
            value={newKitten.description}
            onChange={handleChange}
          ></textarea>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        <button type="submit" className="btn btn-primary me-2">
          Save Kitten
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default AddKittenForm;
