import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  getLitterById,
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
  const [openWeightKittenId, setOpenWeightKittenId] = React.useState<
    string | null
  >(null);
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

  const toggleWeightView = (kittenId: string) => {
    setOpenWeightKittenId(openWeightKittenId === kittenId ? null : kittenId);
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

  if (isLoading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Loading litter details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5 alert alert-danger">Error: {error}</div>
    );
  }

  if (!litter) {
    return (
      <div className="container mt-5 alert alert-warning">
        Litter not found or details could not be loaded.
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Breadcrumbs for better navigation */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {litter.name}
          </li>
        </ol>
      </nav>

      {/* Litter Details Card */}
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

      {/* Kittens Section */}
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
            <div className="card p-3 mb-4 bg-light border">
              <h5>Add a New Kitten</h5>
              <form onSubmit={handleAddKittenSubmit}>
                {/* Form fields for new kitten */}
                {/* ... (previous form implementation is good, just ensure it's inside this card) */}
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
                    onChange={handleNewKittenChange}
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
                      onChange={handleNewKittenChange}
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
                      onChange={handleNewKittenChange}
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
                    onChange={handleNewKittenChange}
                  ></textarea>
                </div>

                {kittenSubmitError && (
                  <div className="alert alert-danger">{kittenSubmitError}</div>
                )}
                <button type="submit" className="btn btn-primary">
                  Save Kitten
                </button>
              </form>
            </div>
          )}

          {litter.kittens && litter.kittens.length > 0 ? (
            <div className="accordion" id="kittenAccordion">
              {litter.kittens.map((kitten) => (
                <div className="accordion-item" key={kitten.id}>
                  <h2 className="accordion-header" id={`heading-${kitten.id}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      onClick={() => toggleWeightView(kitten.id)}
                    >
                      <span className="fw-bold fs-5 me-2">{kitten.name}</span>
                      <small className="text-muted">
                        ({kitten.gender} - {kitten.color})
                      </small>
                    </button>
                  </h2>
                  <div
                    id={`collapse-${kitten.id}`}
                    className={`accordion-collapse collapse ${
                      openWeightKittenId === kitten.id ? "show" : ""
                    }`}
                  >
                    <div className="accordion-body">
                      <p>{kitten.description}</p>
                      <hr />
                      <h6>Weight History</h6>
                      {allWeightRecords[kitten.id] &&
                      allWeightRecords[kitten.id].length > 0 ? (
                        <table className="table table-striped table-sm">
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Weight (g)</th>
                              <th>Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allWeightRecords[kitten.id].map((record) => (
                              <tr key={record.id}>
                                <td>
                                  {new Date(
                                    record.dateRecorded
                                  ).toLocaleDateString()}
                                </td>
                                <td>{record.weightInGrams}g</td>
                                <td>{record.notes}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-muted">No weight records yet.</p>
                      )}
                      <button
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() =>
                          setShowAddWeightFormForKitten(
                            showAddWeightFormForKitten === kitten.id
                              ? null
                              : kitten.id
                          )
                        }
                      >
                        {showAddWeightFormForKitten === kitten.id
                          ? "Cancel"
                          : "Add New Weight"}
                      </button>

                      {showAddWeightFormForKitten === kitten.id && (
                        <div className="card p-3 mt-3 bg-light">
                          {/* ... Add Weight Form ... */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">
              No kittens in this litter yet.
            </p>
          )}
        </div>
      </div>

      {/* Weight Chart Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light">
          <h4 className="h5 mb-0">Weight Progress</h4>
        </div>
        <div className="card-body">
          <WeightChart
            kittens={litter.kittens}
            weightRecords={allWeightRecords}
          />
        </div>
      </div>
    </div>
  );
};

export default LitterDetailPage;
