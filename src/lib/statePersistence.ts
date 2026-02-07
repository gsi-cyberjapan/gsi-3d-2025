import { deserializeState, DeserializedState } from "@/lib/stateSerializer";

const COOKIE_NAME = "gsi3d";
const COOKIE_MAX_AGE = 31536000; // 1 year
const COOKIE_MAX_BYTES = 3500;

// --- Hash ---

export const readHashState = (): DeserializedState => {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return {};
  return deserializeState(hash);
};

export const writeHashState = (serialized: string): void => {
  if (typeof window === "undefined") return;
  const newHash = serialized ? `#${serialized}` : "";
  if (window.location.hash !== newHash) {
    history.replaceState(null, "", newHash || window.location.pathname);
  }
};

// --- Cookie ---

export const readCookieState = (): DeserializedState => {
  if (typeof document === "undefined") return {};
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return {};
  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return deserializeState(value);
};

export const writeCookieState = (serialized: string): void => {
  if (typeof document === "undefined") return;

  let value = serialized;

  // Overflow protection: if too large, strip optional layers
  if (new Blob([value]).size > COOKIE_MAX_BYTES) {
    // Remove ol= and sol= params
    value = value
      .split("&")
      .filter((part) => {
        const key = part.split("=")[0];
        return key !== "ol" && key !== "sol";
      })
      .join("&");
  }

  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; path=/; max-age=${String(COOKIE_MAX_AGE)}; SameSite=Lax`;
};

// --- Merged read (hash priority, cookie fallback) ---

export const readPersistedState = (): DeserializedState => {
  const hashState = readHashState();
  const cookieState = readCookieState();

  // Merge: hash takes priority, cookie fills gaps
  const result: DeserializedState = { ...cookieState };

  for (const key of Object.keys(hashState) as (keyof DeserializedState)[]) {
    const value = hashState[key];
    if (value !== undefined) {
      // eslint type workaround: assign through indexed access
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
};
