const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  data?: any;
}

export async function fetchApi<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { data, headers: customHeaders, ...rest } = options;
  
  const headers = new Headers(customHeaders);
  
  // Attach JWT token if present in browser
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("efind_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let body: any = undefined;
  if (data instanceof FormData) {
    body = data;
    // Let browser set multipart content-type boundary
  } else if (data !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(data);
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers,
      body,
    });
  } catch (err: any) {
    console.error(`[API Network Error] Unable to connect to ${url}:`, err);
    throw new Error(`Unable to reach backend server at ${API_BASE}. Please ensure 'python server.py' is running.`);
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
