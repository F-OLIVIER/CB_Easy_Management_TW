import { computed, reactive, ref } from "vue";
import type { ApiResponse, Gestion, House, UserInfo } from "../api/types";
import { COOKIE_NAME, STORAGE_KEYS } from "../config";
import { isLang, setLang } from "../i18n";

interface SessionState {
  user: UserInfo | null;
  houses: House[];
  gestion: Gestion | null;
}

/** Dernières informations utilisateur renvoyées par le backend */
export const session = reactive<SessionState>({ user: null, houses: [], gestion: null });

/** ID du serveur Discord de la maison sélectionnée */
export const houseId = ref<string | null>(localStorage.getItem(STORAGE_KEYS.house));

export const currentHouse = computed(() => session.houses.find((house) => house.Discord === houseId.value) ?? null);
export const isLogged = computed(() => session.gestion?.Logged === true);
export const isOfficer = computed(() => session.gestion?.Officier === true);
export const isAdmin = computed(() => session.gestion?.Admin === true);

// ------------------------- Logos des maisons -------------------------
// Le backend renvoie l'URL d'icône enregistrée au /config du bot, périmée si l'icône du
// serveur Discord a changé depuis. À la connexion, la PWA lit l'icône actuelle chez Discord.

function loadGuildIcons(): Record<string, string | null> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.guildIcons) ?? "{}");
  } catch {
    return {};
  }
}

/** ID serveur Discord → URL de l'icône actuelle (null : serveur sans icône) */
export const guildIcons = ref<Record<string, string | null>>(loadGuildIcons());

export function setGuildIcons(icons: Record<string, string | null>): void {
  guildIcons.value = icons;
  localStorage.setItem(STORAGE_KEYS.guildIcons, JSON.stringify(icons));
}

/** Logo à afficher : icône actuelle lue chez Discord, sinon celle enregistrée par le bot */
export function houseLogoUrl(house: Pick<House, "Discord" | "House_logo"> | null | undefined): string | null {
  if (!house) return null;
  if (house.Discord in guildIcons.value) return guildIcons.value[house.Discord];
  return house.House_logo || null;
}

export function setHouse(id: string | null): void {
  houseId.value = id;
  if (id) localStorage.setItem(STORAGE_KEYS.house, id);
  else localStorage.removeItem(STORAGE_KEYS.house);
}

export function hasSessionCookie(): boolean {
  return document.cookie.split(";").some((item) => item.trim().startsWith(`${COOKIE_NAME}=`));
}

/** Met à jour la session à partir d'une réponse authentifiée du backend */
export function applyResponse(data: ApiResponse): void {
  session.user = data.UserInfo;
  session.houses = data.House ?? [];
  session.gestion = data.Gestion;

  if (isLang(data.UserInfo?.Language)) setLang(data.UserInfo.Language);
  if (session.houses.length === 1) setHouse(session.houses[0].Discord);
}

export function clearSession(): void {
  session.user = null;
  session.houses = [];
  session.gestion = null;
  setHouse(null);
  // Le backend pose le cookie avec Domain=<SITE_DOMAIN> : on tente les deux variantes
  const expired = `${COOKIE_NAME}=; Max-Age=0; path=/`;
  document.cookie = expired;
  document.cookie = `${expired}; domain=${window.location.hostname}`;
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/logout", { credentials: "same-origin" });
  } catch {
    // déconnexion locale même si le serveur est injoignable
  }
  clearSession();
}
