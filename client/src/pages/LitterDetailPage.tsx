import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getLitterById,
  type Kitten,
  type WeightRecord,
  addKittenToLitter as apiAddKitten,
  addWeightRecord as apiAddWeightRecord,
  type LitterDetail,
  getKittenWeightRecords,
} from "../services/LitterService";
import WeightChart from "../components/WeightChart";

interface NewKittenFormData {
  name: string;
  gender: string;
  color: string;
  description: string;
}
interface NewWeightFormData {
  dateRecorded: string;
  weightInGrams: string;
  notes: string;
}

const LitterDetailPage: React.FC = () => {
  const { litterId } = useParams<{ litterId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const [litter, setLitter] = React.useState<LitterDetail | null>(null);
  const [allWeightRecords, setAllWeightRecords] = React.useState<{
    [kittenId: string]: WeightRecord[];
  }>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [showAddKittenForm, setShowAddKittenForm] = React.useState(false);
  const [newKitten, setNewKitten] = React.useState<NewKittenFormData>({
    name: "",
    gender: "",
    color: "",
    description: "",
  });
  const [kittenSubmitError, setKittenSubmitError] = React.useState<
    string | null
  >(null);

  const [showAddWeightFormForKitten, setShowAddWeightFormForKitten] =
    React.useState<string | null>(null);
  const [newWeight, setNewWeight] = React.useState<NewWeightFormData>({
    dateRecorded: new Date().toISOString().split("T")[0],
    weightInGrams: "",
    notes: "",
  });
  const [weightSubmitError, setWeightSubmitError] = React.useState<
    string | null
  >(null);

  const fetchLitterDetails = React.useCallback(async () => {
    if (!litterId) return;
    setIsLoading(true);
    try {
      const litterData = await getLitterById(litterId, getAccessTokenSilently);
      setLitter(litterData);
      if (litterData.kittens?.length > 0) {
        const weightPromises = litterData.kittens.map((k) =>
          getKittenWeightRecords(litterId, k.id, getAccessTokenSilently)
        );
        const weightsByKitten = await Promise.all(weightPromises);
        const weightsMap: { [kittenId: string]: WeightRecord[] } = {};
        litterData.kittens.forEach((k, i) => {
          weightsMap[k.id] = weightsByKitten[i];
        });
        setAllWeightRecords(weightsMap);
      }
    } catch (e: any) {
      setError(e.message);
    }
    setIsLoading(false);
  }, [litterId, getAccessTokenSilently]);

  React.useEffect(() => {
    fetchLitterDetails();
  }, [fetchLitterDetails]);

  const handleNewKittenChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewKitten({ ...newKitten, [e.target.name]: e.target.value });
  };

  const handleAddKittenSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!litterId || !newKitten.name.trim()) {
      setKittenSubmitError("Kitten name is required.");
      return;
    }
    setKittenSubmitError(null);
    try {
      await apiAddKitten(litterId, newKitten, getAccessTokenSilently);
      setShowAddKittenForm(false);
      setNewKitten({ name: "", gender: "", color: "", description: "" });
      fetchLitterDetails();
    } catch (err: any) {
      setKittenSubmitError(err.message || "Failed to add kitten.");
    }
  };

  const handleNewWeightChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewWeight({ ...newWeight, [e.target.name]: e.target.value });
  };

  const handleAddWeightSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    kittenId: string
  ) => {
    e.preventDefault();
    if (!litterId) return;
    if (
      !newWeight.dateRecorded ||
      !newWeight.weightInGrams.trim() ||
      parseFloat(newWeight.weightInGrams) <= 0
    ) {
      setWeightSubmitError("Valid date and positive weight are required.");
      return;
    }
    setWeightSubmitError(null);
    try {
      const weightData = {
        dateRecorded: newWeight.dateRecorded,
        weightInGrams: parseFloat(newWeight.weightInGrams),
        notes: newWeight.notes,
      };
      await apiAddWeightRecord(
        litterId,
        kittenId,
        weightData,
        getAccessTokenSilently
      );
      setShowAddWeightFormForKitten(null);
      setNewWeight({
        dateRecorded: new Date().toISOString().split("T")[0],
        weightInGrams: "",
        notes: "",
      });
      fetchLitterDetails();
    } catch (err: any) {
      setWeightSubmitError(err.message || "Failed to add weight record.");
    }
  };

  if (isLoading)
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading litter details...</p>
      </div>
    );
  if (error)
    return (
      <div className="container mt-5 alert alert-danger">Error: {error}</div>
    );
  if (!litter)
    return (
      <div className="container mt-5 alert alert-warning">
        Litter not found or details could not be loaded.
      </div>
    );

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {litter.name || "Litter Details"}
          </li>
        </ol>
      </nav>
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h2>{litter.name}</h2>
          <small>ID: {litter.id}</small>
        </div>
        <div className="card-body">
          <p>
            <strong>Date of Birth:</strong>{" "}
            {new Date(litter.dateOfBirth).toLocaleDateString()}
          </p>
          {litter.motherName && (
            <p>
              <strong>Mother:</strong> {litter.motherName}
            </p>
          )}
          {litter.breed && (
            <p>
              <strong>Breed:</strong> {litter.breed}
            </p>
          )}
          {litter.notes && (
            <p>
              <strong>Notes:</strong> {litter.notes}
            </p>
          )}
        </div>
        <div className="card-footer text-end">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              alert("Edit Litter functionality not yet implemented.")
            }
          >
            Edit Litter Details
          </button>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h4>Weight Progress Chart</h4>
          </div>
          <div className="card-body">
            <WeightChart
              kittens={litter.kittens}
              weightRecords={allWeightRecords}
            />
          </div>
        </div>

        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Kittens in this Litter</h4>
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowAddKittenForm(!showAddKittenForm)}
          >
            {showAddKittenForm ? "Cancel Add Kitten" : "Add New Kitten"}
          </button>
        </div>
        <div className="card-body">
          {showAddKittenForm && (
            <div className="card p-3 mb-3 bg-light">
              <h5>Add New Kitten</h5>
              <form onSubmit={handleAddKittenSubmit}>
                <div className="mb-2">
                  <label htmlFor="kittenName" className="form-label">
                    Name*
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    id="kittenName"
                    name="name"
                    value={newKitten.name}
                    onChange={handleNewKittenChange}
                    required
                  />
                </div>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <label htmlFor="kittenGender" className="form-label">
                      Gender
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="kittenGender"
                      name="gender"
                      value={newKitten.gender}
                      onChange={handleNewKittenChange}
                      placeholder="e.g., Male, Female"
                    />
                  </div>
                  <div className="col-md-6 mb-2">
                    <label htmlFor="kittenColor" className="form-label">
                      Color/Markings
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      id="kittenColor"
                      name="color"
                      value={newKitten.color}
                      onChange={handleNewKittenChange}
                      placeholder="e.g., Tabby, Black"
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label htmlFor="kittenDescription" className="form-label">
                    Description/Notes
                  </label>
                  <textarea
                    className="form-control form-control-sm"
                    id="kittenDescription"
                    name="description"
                    rows={2}
                    value={newKitten.description}
                    onChange={handleNewKittenChange}
                  ></textarea>
                </div>
                {kittenSubmitError && (
                  <div className="alert alert-danger alert-sm p-2">
                    {kittenSubmitError}
                  </div>
                )}
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Kitten
                </button>
              </form>
            </div>
          )}

          {litter.kittens && litter.kittens.length > 0 ? (
            <div className="list-group">
              {litter.kittens.map((kitten) => (
                <div key={kitten.id} className="list-group-item">
                  <div className="d-flex w-100 justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-1">{kitten.name}</h5>
                      <small className="text-muted">ID: {kitten.id}</small>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={() =>
                          setShowAddWeightFormForKitten(
                            showAddWeightFormForKitten === kitten.id
                              ? null
                              : kitten.id
                          )
                        }
                      >
                        {showAddWeightFormForKitten === kitten.id
                          ? "Cancel Weight"
                          : "Add Weight"}
                      </button>
                      {/* TODO: Add Edit/Delete Kitten buttons */}
                    </div>
                  </div>
                  <p className="mb-1">
                    {kitten.gender && `${kitten.gender}`}{" "}
                    {kitten.color && ` - ${kitten.color}`}
                  </p>
                  {kitten.description && (
                    <small className="text-muted d-block mb-2">
                      {kitten.description}
                    </small>
                  )}

                  {showAddWeightFormForKitten === kitten.id && (
                    <div className="card p-3 mt-2 bg-light border-info">
                      <h6>Add Weight for {kitten.name}</h6>
                      <form
                        onSubmit={(e) => handleAddWeightSubmit(e, kitten.id)}
                      >
                        <div className="row">
                          <div className="col-md-6 mb-2">
                            <label
                              htmlFor={`weightDate-${kitten.id}`}
                              className="form-label"
                            >
                              Date*
                            </label>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              id={`weightDate-${kitten.id}`}
                              name="dateRecorded"
                              value={newWeight.dateRecorded}
                              onChange={handleNewWeightChange}
                              required
                            />
                          </div>
                          <div className="col-md-6 mb-2">
                            <label
                              htmlFor={`weightGrams-${kitten.id}`}
                              className="form-label"
                            >
                              Weight (grams)*
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm"
                              id={`weightGrams-${kitten.id}`}
                              name="weightInGrams"
                              value={newWeight.weightInGrams}
                              onChange={handleNewWeightChange}
                              placeholder="e.g., 120.5"
                              required
                            />
                          </div>
                        </div>
                        <div className="mb-2">
                          <label
                            htmlFor={`weightNotes-${kitten.id}`}
                            className="form-label"
                          >
                            Notes
                          </label>
                          <textarea
                            className="form-control form-control-sm"
                            id={`weightNotes-${kitten.id}`}
                            name="notes"
                            rows={2}
                            value={newWeight.notes}
                            onChange={handleNewWeightChange}
                          ></textarea>
                        </div>
                        {weightSubmitError && (
                          <div className="alert alert-danger alert-sm p-2">
                            {weightSubmitError}
                          </div>
                        )}
                        <button type="submit" className="btn btn-info btn-sm">
                          Save Weight
                        </button>
                      </form>
                    </div>
                  )}
                  {/* TODO: Display list of weight records for this kitten */}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No kittens added to this litter yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default LitterDetailPage;
