import axios from "axios";

// Known public Google OAuth Web Client ID for this Prep project
export const DEFAULT_GOOGLE_CLIENT_ID =
  "776270035755-ge6mg64nbafmfc1vabsd2a07n1gen4tg.apps.googleusercontent.com";

let cachedClientId = null;

/**
 * Resolves the Google OAuth Client ID across multiple environments:
 * 1. Vite environment variables (GOOGLE_CLIENT_ID or VITE_GOOGLE_CLIENT_ID)
 * 2. Backend runtime configuration endpoint (/api/auth/config)
 * 3. Default project client ID fallback
 */
export async function getGoogleClientId() {
  if (cachedClientId) {
    return cachedClientId;
  }

  // 1. Build-time environment variable (supports both VITE_ and GOOGLE_ prefixes)
  const envClientId =
    import.meta.env.GOOGLE_CLIENT_ID ||
    import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (envClientId && typeof envClientId === "string" && envClientId.trim() !== "") {
    cachedClientId = envClientId.trim();
    return cachedClientId;
  }

  // 2. Runtime backend configuration endpoint
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const response = await axios.get(`${apiUrl}/api/auth/config`, {
      timeout: 4000,
    });
    const backendId = response.data?.googleClientId || response.data?.clientId;
    if (backendId && typeof backendId === "string" && backendId.trim() !== "") {
      cachedClientId = backendId.trim();
      return cachedClientId;
    }
  } catch (error) {
    // Non-fatal: if backend is sleeping or unreachable, fall back gracefully
    console.debug("Could not fetch Google Client ID from backend /api/auth/config:", error?.message);
  }

  // 3. Fallback to default public project client ID
  if (DEFAULT_GOOGLE_CLIENT_ID) {
    cachedClientId = DEFAULT_GOOGLE_CLIENT_ID;
    return cachedClientId;
  }

  return null;
}
