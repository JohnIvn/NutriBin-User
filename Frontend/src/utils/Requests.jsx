import axios from "axios";

// Normalize backend base URL so even a bare host like
// "nutribin-server-backend-production.up.railway.app" becomes a valid HTTPS URL.
function getBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;

  if (raw && typeof raw === "string") {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    // Assume HTTPS if protocol is missing
    return `https://${raw}`;
  }

  // Production default
  return "https://nutribin-user-backend-production.up.railway.app";
}

const api = axios.create({
  baseURL: getBaseUrl(),
});

async function Requests({
  url,
  method = "GET",
  params,
  data,
  auth,
  credentials,
}) {
  try {
    const response = await api.request({
      url,
      method,
      params: params || undefined,
      data: data || undefined,
      auth: auth || undefined,
      withCredentials: credentials,
    });

    return response;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Try production first then fall back to localhost for POSTs (helps with CORS/dev)
const PROD_API = "https://nutribin-user-backend-production.up.railway.app";
const LOCAL_API = "http://localhost:3000";

export async function postToBackend(path, data, config) {
  const envUrl = import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/$/, "")
    : null;
  const bases = [envUrl || PROD_API, LOCAL_API];

  let lastErr = null;
  for (const base of bases) {
    const url =
      `${base.replace(/\/$/, "")} ${path.startsWith("/") ? path : `/${path}`}`.replace(
        /\s+/,
        "",
      );
    try {
      return await axios.post(url, data, config);
    } catch (err) {
      lastErr = err;
      if (err && err.response) throw err;
      // otherwise try next base
    }
  }
  throw lastErr;
}

export default Requests;
