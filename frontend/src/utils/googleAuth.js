/**
 * Shared Google Identity Services (GIS) Utility
 * 
 * Provides singleton initialization, safe script loading, and button rendering
 * to prevent duplicate script tags and multiple initialize() calls.
 */

let scriptLoadingPromise = null;
let isGisInitialized = false;
let initializedClientId = null;
let activeCallback = null;

/**
 * Returns the Google Client ID strictly from VITE_GOOGLE_CLIENT_ID.
 * No hardcoded Client IDs or arbitrary fallbacks.
 */
export function getGoogleClientId() {
  const envClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (envClientId && typeof envClientId === "string" && envClientId.trim() !== "") {
    return envClientId.trim();
  }
  return null;
}

/**
 * Logs non-sensitive development diagnostics to help diagnose origin mismatches
 * and configuration discrepancies in Google Cloud Console.
 * NEVER logs tokens, passwords, or credentials.
 */
function logDevDiagnostics(clientId) {
  if (!import.meta.env.DEV) return;

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "unknown";
  const currentHost = typeof window !== "undefined" ? window.location.host : "unknown";
  const currentPort = typeof window !== "undefined" ? window.location.port : "unknown";
  const currentProtocol = typeof window !== "undefined" ? window.location.protocol : "unknown";
  const clientPrefix = clientId
    ? `${clientId.substring(0, 16)}...${clientId.slice(-20)}`
    : "NOT_CONFIGURED";

  console.info(
    "%c[Google Sign-In Dev Diagnostics]%c",
    "color: #4f46e5; font-weight: bold; font-size: 11px;",
    "color: inherit;",
    {
      browserOrigin: currentOrigin,
      browserHost: currentHost,
      browserPort: currentPort || "(default)",
      browserProtocol: currentProtocol,
      configuredClientId: clientPrefix,
      clientIdFullLength: clientId ? clientId.length : 0,
      isGsiScriptLoaded: Boolean(window.google?.accounts?.id),
    }
  );

  // Help developer spot common localhost vs 127.0.0.1 mismatch immediately
  if (currentOrigin.startsWith("http://127.0.0.1")) {
    console.warn(
      "[Google Sign-In Diagnostics] You are browsing on 'http://127.0.0.1'. " +
      "If Google Cloud Authorized JavaScript Origins contains 'http://localhost:5173', " +
      "Google will reject the request with 403. Please access via 'http://localhost:5173'."
    );
  }
}

/**
 * Safely loads the Google Identity Services script if not already present.
 * Avoids duplicate script tags in the DOM.
 */
export function loadGsiScript() {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if script tag already exists in HTML
    let script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        resolve(window.google.accounts.id);
        return true;
      }
      return false;
    };

    if (checkGsi()) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (checkGsi() || attempts > 30) {
        clearInterval(interval);
        if (!window.google?.accounts?.id) {
          console.warn("Google Identity Services script did not initialize in time.");
        }
        resolve(window.google?.accounts?.id || null);
      }
    }, 100);

    script.addEventListener("error", (err) => {
      console.warn("Failed to load Google Identity Services script:", err);
      clearInterval(interval);
      scriptLoadingPromise = null;
      resolve(null);
    }, { once: true });
  });

  return scriptLoadingPromise;
}

/**
 * Initializes Google Identity Services ONCE per client ID.
 * If already initialized with this client ID, updates the active credential
 * callback without re-invoking window.google.accounts.id.initialize().
 */
export function initGoogleIdentity(clientId, onCredential) {
  if (!clientId || !window.google?.accounts?.id) {
    if (import.meta.env.DEV && !clientId) {
      console.warn("[Google Sign-In] Cannot initialize: VITE_GOOGLE_CLIENT_ID is missing or empty.");
    }
    return false;
  }

  // Update active credential callback for the currently mounted component
  activeCallback = onCredential;

  // Log non-sensitive diagnostics in development mode
  logDevDiagnostics(clientId);

  // Only call window.google.accounts.id.initialize once for the given client ID
  if (!isGisInitialized || initializedClientId !== clientId) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (activeCallback) {
            activeCallback(response);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
      });

      isGisInitialized = true;
      initializedClientId = clientId;
    } catch (err) {
      console.warn("Failed to initialize Google Identity Services:", err);
      return false;
    }
  }

  return true;
}

/**
 * Safely renders the Google Sign-In button into a container element.
 * Verifies that the client ID initialized matches the current configuration.
 */
export function renderGoogleButton(container, options = {}) {
  if (!container || !window.google?.accounts?.id) {
    return false;
  }

  if (!isGisInitialized || !initializedClientId) {
    console.warn("[Google Sign-In] Attempted to render Google button before GIS was initialized.");
    return false;
  }

  try {
    container.innerHTML = "";
    const containerWidth = Math.min(
      Math.max(container.offsetWidth || 340, 240),
      400
    );

    window.google.accounts.id.renderButton(container, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: containerWidth,
      ...options,
    });
    return true;
  } catch (err) {
    console.warn("Failed to render Google Sign-In button:", err);
    return false;
  }
}

/**
 * Clears the active credential callback on component unmount
 * so unmounted component handlers are not called.
 */
export function detachGoogleCallback(callback) {
  if (activeCallback === callback) {
    activeCallback = null;
  }
}
