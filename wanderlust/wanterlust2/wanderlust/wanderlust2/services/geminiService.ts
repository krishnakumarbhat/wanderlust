import { Place, PlaceStatus } from "../types";

const BACKEND_URL = "http://localhost:5001";

interface AuthResponse {
  token: string;
  user_id: number;
}

interface AuthForm {
  username?: string;
  email: string;
  password: string;
  age?: number;
  isBiker?: boolean;
  homeCity?: string;
}

export const loginUser = async (payload: AuthForm): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return response.json();
};

export const registerUser = async (payload: AuthForm): Promise<AuthResponse> => {
  const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      age: payload.age ?? 26,
      is_biker: payload.isBiker ?? true,
      home_city: payload.homeCity ?? "Bengaluru",
      home_lat: 12.9716,
      home_lng: 77.5946,
    }),
  });

  if (!response.ok) {
    throw new Error("Registration failed");
  }

  return response.json();
};

export const getTravelRecommendations = async (places: Place[]): Promise<any[]> => {
  const visitedNames = places
    .filter(p => p.status === PlaceStatus.VISITED)
    .map(p => p.name);
  const bucketNames = places
    .filter(p => p.status === PlaceStatus.BUCKET_LIST)
    .map(p => p.name);

  try {
    const response = await fetch(`${BACKEND_URL}/api/recommendations/demo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        top_k: 3,
        visited_place_names: visitedNames,
        bucket_place_names: bucketNames,
        profile: {
          age: 26,
          is_biker: true,
          home_lat: 12.9716,
          home_lng: 77.5946,
        },
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = data?.results ?? [];
    return results.map((rec: any) => ({
      name: rec.name,
      description: `Score ${rec.score ?? "N/A"} • ${rec.tags?.join(", ") ?? ""}`,
      lat: rec.lat,
      lng: rec.lng,
    }));
  } catch (error) {
    console.error("Error getting backend recommendations:", error);
    return [];
  }
};

export const getPlaceInfo = async (placeName: string): Promise<string> => {
  return `Tip: ${placeName} is best explored with local food stops and early morning starts.`;
};
