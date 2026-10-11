import { onMounted, ref, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { apiCall, SessionExpiredError } from "./client";
import type { ApiResponse } from "./types";
import { houseId, session, setHouse } from "../stores/session";
import { showToast } from "../stores/toast";
import { lang } from "../i18n";

export type Role = "user" | "officier" | "admin";

const MESSAGES = {
  forbidden: { fr: "Accès réservé.", en: "Restricted access." },
  network: { fr: "Impossible de joindre le serveur.", en: "Unable to reach the server." },
};

/**
 * Charge les données d'une page privée et expose `submit` pour les mises à jour.
 * Gère la session expirée, les droits (officier/admin) et les erreurs réseau.
 */
export function usePage(endpoint: string, role: Role = "user") {
  const router = useRouter();
  const data = shallowRef<ApiResponse | null>(null);
  const loading = ref(true);
  const busy = ref(false);

  function hasRole(response: ApiResponse): boolean {
    if (role === "officier") return response.Gestion.Officier;
    if (role === "admin") return response.Gestion.Admin;
    return true;
  }

  async function run(target: string, body?: unknown): Promise<ApiResponse | null> {
    try {
      const houseBefore = houseId.value;
      const response = await apiCall(target, body);

      // Maison choisie automatiquement par applyResponse : les données reçues concernaient
      // une autre maison, on recharge (uniquement pour une lecture, jamais pour un envoi)
      if (houseId.value !== houseBefore && body === undefined) return run(target);

      // Maison mémorisée qui n'appartient plus à l'utilisateur
      if (houseId.value && !session.houses.some((house) => house.Discord === houseId.value)) {
        setHouse(null);
        await router.replace("/home");
        return null;
      }
      if (!hasRole(response)) {
        showToast(MESSAGES.forbidden[lang.value], "error");
        await router.replace("/home");
        return null;
      }
      data.value = response;
      return response;
    } catch (error) {
      if (error instanceof SessionExpiredError) {
        await router.replace("/");
      } else {
        console.error(error);
        showToast(error instanceof Error && error.message ? error.message : MESSAGES.network[lang.value], "error");
      }
      return null;
    }
  }

  /** (Re)charge la page, éventuellement via une autre route GET-like */
  async function load(target = endpoint): Promise<ApiResponse | null> {
    loading.value = true;
    try {
      return await run(target);
    } finally {
      loading.value = false;
    }
  }

  /** Envoie une mise à jour ; ignore les doubles clics pendant l'envoi */
  async function submit(target: string, body?: unknown): Promise<ApiResponse | null> {
    if (busy.value) return null;
    busy.value = true;
    try {
      return await run(target, body);
    } finally {
      busy.value = false;
    }
  }

  onMounted(() => load());

  return { data, loading, busy, load, submit };
}
