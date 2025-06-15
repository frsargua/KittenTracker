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
  type KittenCreationData,
} from "../../services/LitterService";
import LitterInfo from "./Components/LitterInfo";
import KittenList from "./Components/KittenList";
import WeightChart from "../../components/WeightChart";
import LoadingSpinner from "../../components/LoadingSpinner";

const LitterDetailPage: React.FC = () => {
  const { litterId } = useParams<{ litterId: string }>();
  const { getAccessTokenSilently } = useAuth0();
  const [litter, setLitter] = React.useState<LitterDetail | null>(null);
  const [allWeightRecords, setAllWeightRecords] = React.useState<{
    [kittenId: string]: WeightRecord[];
  }>({});
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  const handleAddKitten = async (kittenData: KittenCreationData) => {
    if (!litterId) return;
    await apiAddKitten(litterId, kittenData, getAccessTokenSilently);
    fetchLitterDetails();
  };

  const handleAddWeight = async (kittenId: string, formData: FormData) => {
    if (!litterId) return;
    await apiAddWeightRecord(
      litterId,
      kittenId,
      formData,
      getAccessTokenSilently
    );
    fetchLitterDetails();
  };

  if (isLoading) {
    return <LoadingSpinner message="Fetching litter details..." />;
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

      <LitterInfo litter={litter} />

      <KittenList
        kittens={litter.kittens || []}
        allWeightRecords={allWeightRecords}
        onAddKitten={handleAddKitten}
        onAddWeight={handleAddWeight}
      />

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
