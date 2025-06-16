export type LitterCreationData = Pick<
  Litter,
  "name" | "dateOfBirth" | "motherName" | "breed" | "notes"
>;
export type LitterUpdateData = Partial<LitterCreationData>;

export type KittenCreationData = Pick<
  Kitten,
  "name" | "gender" | "color" | "description"
>;
export type KittenUpdateData = Partial<KittenCreationData>;

export type WeightRecordCreationData = Pick<
  WeightRecord,
  "dateRecorded" | "weightInGrams" | "notes" | "photoUrl"
>;
export type WeightRecordUpdateData = Partial<WeightRecordCreationData>;

export interface Litter {
  id: string;
  name: string;
  dateOfBirth: string | Date;
  motherName?: string;
  breed?: string;
  otherBreed?: string;
  notes?: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
  kittens?: Kitten[];
}

export interface Kitten {
  id: string;
  litterId: string;
  userId: string;
  name: string;
  gender?: string;
  color?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  weightRecords?: WeightRecord[];
}

export interface WeightRecord {
  id: string;
  kittenId: string;
  userId: string;
  dateRecorded: string | Date;
  weightInGrams: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  photoUrl?: string;
}

export interface LitterDetail extends Omit<Litter, "kittens"> {
  kittens: Kitten[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
type AccessTokenGetter = () => Promise<string>;

async function makeAuthenticatedRequest<T = any>(
  url: string,
  method: string,
  getAccessTokenSilently: AccessTokenGetter,
  body?: any
): Promise<T> {
  const token = await getAccessTokenSilently();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData = {
      message: `Request failed: ${response.status} ${response.statusText}`,
    };
    try {
      const potentialErrorData = await response.json();
      if (potentialErrorData && potentialErrorData.message) {
        errorData = potentialErrorData;
      }
    } catch (e) {
      /* Ignore */
    }
    console.error(`API Error (${method} ${url}):`, errorData.message);
    throw new Error(errorData.message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return await response.json();
  }
  return {} as T;
}

async function makeAuthenticatedMultipartRequest<T = any>(
  url: string,
  method: string,
  getAccessTokenSilently: AccessTokenGetter,
  formData: FormData
): Promise<T> {
  const token = await getAccessTokenSilently();
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
    // No 'Content-Type' header, the browser will set it for FormData
  };

  const config: RequestInit = {
    method,
    headers,
    body: formData,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData = {
      message: `Request failed: ${response.status} ${response.statusText}`,
    };
    try {
      const potentialErrorData = await response.json();
      if (potentialErrorData && potentialErrorData.message) {
        errorData = potentialErrorData;
      }
    } catch (e) {
      /* Ignore */
    }
    console.error(`API Error (${method} ${url}):`, errorData.message);
    throw new Error(errorData.message);
  }

  return response.json();
}

export const getUserLitters = async (
  getAccessTokenSilently: AccessTokenGetter
): Promise<Litter[]> => {
  return makeAuthenticatedRequest<Litter[]>(
    `${API_BASE_URL}/litters`,
    "GET",
    getAccessTokenSilently
  );
};

export const createLitter = async (
  litterData: LitterCreationData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<Litter> => {
  return makeAuthenticatedRequest<Litter>(
    `${API_BASE_URL}/litters`,
    "POST",
    getAccessTokenSilently,
    litterData
  );
};

export const getLitterById = async (
  litterId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<LitterDetail> => {
  return makeAuthenticatedRequest<LitterDetail>(
    `${API_BASE_URL}/litters/${litterId}`,
    "GET",
    getAccessTokenSilently
  );
};

export const updateLitter = async (
  litterId: string,
  litterData: LitterUpdateData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<Litter> => {
  return makeAuthenticatedRequest<Litter>(
    `${API_BASE_URL}/litters/${litterId}`,
    "PUT",
    getAccessTokenSilently,
    litterData
  );
};

export const deleteLitter = async (
  litterId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<void> => {
  await makeAuthenticatedRequest<void>(
    `${API_BASE_URL}/litters/${litterId}`,
    "DELETE",
    getAccessTokenSilently
  );
};

export const addKittenToLitter = async (
  litterId: string,
  kittenData: KittenCreationData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<Kitten> => {
  return makeAuthenticatedRequest<Kitten>(
    `${API_BASE_URL}/litters/${litterId}/kittens`,
    "POST",
    getAccessTokenSilently,
    kittenData
  );
};

export const updateKitten = async (
  litterId: string,
  kittenId: string,
  kittenData: KittenUpdateData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<Kitten> => {
  return makeAuthenticatedRequest<Kitten>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}`,
    "PUT",
    getAccessTokenSilently,
    kittenData
  );
};

export const removeKitten = async (
  litterId: string,
  kittenId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<void> => {
  await makeAuthenticatedRequest<void>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}`,
    "DELETE",
    getAccessTokenSilently
  );
};

export const getKittenById = async (
  litterId: string,
  kittenId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<Kitten> => {
  return makeAuthenticatedRequest<Kitten>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}`,
    "GET",
    getAccessTokenSilently
  );
};

export const addWeightRecord = async (
  litterId: string,
  kittenId: string,
  weightRecordData: FormData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<WeightRecord> => {
  return makeAuthenticatedMultipartRequest<WeightRecord>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}/weights`,
    "POST",
    getAccessTokenSilently,
    weightRecordData
  );
};

export const getKittenWeightRecords = async (
  litterId: string,
  kittenId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<WeightRecord[]> => {
  return makeAuthenticatedRequest<WeightRecord[]>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}/weights`,
    "GET",
    getAccessTokenSilently
  );
};

export const updateWeightRecord = async (
  litterId: string,
  kittenId: string,
  weightId: string,
  weightData: WeightRecordUpdateData,
  getAccessTokenSilently: AccessTokenGetter
): Promise<WeightRecord> => {
  return makeAuthenticatedRequest<WeightRecord>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}/weights/${weightId}`,
    "PUT",
    getAccessTokenSilently,
    weightData
  );
};

export const removeWeightRecord = async (
  litterId: string,
  kittenId: string,
  weightId: string,
  getAccessTokenSilently: AccessTokenGetter
): Promise<void> => {
  await makeAuthenticatedRequest<void>(
    `${API_BASE_URL}/litters/${litterId}/kittens/${kittenId}/weights/${weightId}`,
    "DELETE",
    getAccessTokenSilently
  );
};
