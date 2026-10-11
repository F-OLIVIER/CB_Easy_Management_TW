import type { ApiResponse, Notif } from "./types";
import { applyResponse, clearSession, hasSessionCookie, houseId } from "../stores/session";
import { showToast } from "../stores/toast";
import { tr } from "../i18n";

/** Session absente ou expirée : l'utilisateur doit se reconnecter */
export class SessionExpiredError extends Error {
  constructor() {
    super("Session expirée");
  }
}

// Le backend limite le débit par client (5 req/s) : réponse 429, on réessaie.
// (Les anciennes versions du backend répondaient 200 avec un corps vide : même traitement.)
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 300;

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** POST brut avec gestion du limiteur de débit ; renvoie le JSON décodé */
export async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method: "POST", credentials: "same-origin" };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.headers = { "Content-Type": "application/json" };
    init.body = JSON.stringify(body);
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, init);
    if (response.status === 429) {
      await sleep(RETRY_DELAY_MS * attempt);
      continue;
    }
    if (!response.ok) throw new Error(`Erreur réseau : ${response.status}`);

    const text = await response.text();
    if (text.trim() !== "") return JSON.parse(text) as T;
    await sleep(RETRY_DELAY_MS * attempt);
  }
  throw new Error("Le serveur est surchargé, réessayez dans quelques instants.");
}

export function notify(notification: Notif | undefined): void {
  if (notification?.Notif) {
    showToast(tr(notification.content), notification.Type === "error" ? "error" : "success");
  }
}

/**
 * Appelle une route /api/<endpoint>/ pour la maison sélectionnée.
 * Met à jour la session et affiche la notification éventuelle du backend.
 */
export async function apiCall(endpoint: string, body?: unknown): Promise<ApiResponse> {
  // Sans session, inutile d'appeler le backend
  if (!hasSessionCookie()) {
    clearSession();
    throw new SessionExpiredError();
  }

  const house = encodeURIComponent(houseId.value ?? "null");
  const data = await postJson<ApiResponse>(`/api/${endpoint}/?house=${house}`, body);

  if (!data?.Gestion?.Logged) {
    clearSession();
    throw new SessionExpiredError();
  }

  applyResponse(data);
  notify(data.Gestion.Notification);
  return data;
}
