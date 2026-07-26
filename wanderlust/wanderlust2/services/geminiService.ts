const BACKEND_FALLBACK = 'http://localhost:5001';

export async function getTravelRecommendations(
  visitedNames: string[],
  bucketNames: string[],
  authToken: string | null,
  backendUrl?: string,
): Promise<any[]> {
  const url = backendUrl || BACKEND_FALLBACK;

  // If authenticated, use cascade endpoint
  if (authToken) {
    const res = await fetch(`${url}/api/recommendations/cascade`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ top_k: 5 }),
    });
    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  }

  // Guest: use demo endpoint
  const res = await fetch(`${url}/api/recommendations/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      visited_place_names: visitedNames,
      bucket_place_names: bucketNames,
      top_k: 3,
      profile: { age: 26, is_biker: true },
    }),
  });
  if (!res.ok) throw new Error(`Backend error: ${res.status}`);
  const data = await res.json();
  return data.results || [];
}

export async function loginUser(
  email: string,
  password: string,
  backendUrl?: string,
): Promise<{ token?: string; error?: string }> {
  const url = backendUrl || BACKEND_FALLBACK;
  const res = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || 'Login failed' };
  return { token: data.token };
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  backendUrl?: string,
): Promise<{ token?: string; error?: string }> {
  const url = backendUrl || BACKEND_FALLBACK;
  const res = await fetch(`${url}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      age: 26,
      is_biker: true,
      home_lat: 12.9716,
      home_lng: 77.5946,
    }),
  });
  const data = await res.json();
  if (!res.ok) return { error: data.error || 'Registration failed' };
  return { token: data.token };
}
