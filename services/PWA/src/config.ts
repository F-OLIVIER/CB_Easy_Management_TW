// Configuration issue des variables d'environnement (voir env.example).

/** Nom du cookie de session posé par le backend Go */
export const COOKIE_NAME = "user_token";

/** Clés localStorage partagées avec l'ancien front (même domaine = même stockage) */
export const STORAGE_KEYS = {
  lang: "selectedLang",
  house: "user_house",
  notif: "notif",
  guildIcons: "discord_guild_icons",
} as const;

/** Cache du service worker contenant les avatars Discord (voir vite.config.ts), vidé à la déconnexion */
export const AVATAR_CACHE = "emtw-discord-avatars";

const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI || `${window.location.origin}/discord`;

/** Clé sessionStorage du paramètre OAuth2 `state` (protection CSRF de la connexion) */
export const OAUTH_STATE_KEY = "discord_oauth_state";

/** Redirige vers l'authentification Discord (flux implicite).
 *  `guilds` sert uniquement à récupérer l'icône à jour des serveurs (logo des maisons). */
export function loginWithDiscord(): void {
  // getRandomValues fonctionne aussi hors HTTPS (contrairement à randomUUID)
  const state = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
  window.location.href =
    "https://discord.com/oauth2/authorize?" +
    new URLSearchParams({
      client_id: import.meta.env.VITE_DISCORD_CLIENT_ID ?? "",
      response_type: "token",
      redirect_uri: redirectUri,
      scope: "identify guilds",
      state,
    }).toString();
}

export const LINK_INVITE_BOT = import.meta.env.VITE_LINK_INVITE_BOT ?? "";

/** Valeur stockée en base pour l'option "Consulter un officier" des groupes TW */
export const OFFICER_UNIT_VALUE = "Consulter un officier";
/** Valeurs historiques (l'ancien front enregistrait le libellé traduit) */
export const OFFICER_UNIT_VALUES = [OFFICER_UNIT_VALUE, "Consult an officer"];
