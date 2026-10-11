// Fixtures communes à tous les tests e2e.
import { test as base, expect, type Page, type Route } from "@playwright/test";
import { resetDatabase } from "./db";
import { HOUSE, USERS, type Role } from "./seed";

export { expect };
export { FORUM, HOUSE, USERS, type Role } from "./seed";
export { execute, queryAll, queryOne } from "./db";

export interface DiscordIdentity {
  id: string;
  username: string;
  /** Serveurs renvoyés par /users/@me/guilds (icône du logo de maison) */
  guilds?: { id: string; icon: string | null }[];
}

interface Fixtures {
  /** Ouvre une session pour un rôle (cookie de session + maison sélectionnée) */
  loginAs: (role: Role) => Promise<void>;
  /** Simule Discord (OAuth2 + API) ; renvoie les paramètres de la demande d'autorisation */
  mockDiscord: (identity: DiscordIdentity, options?: { tamperState?: boolean }) => Promise<{ authorizeParams: () => URLSearchParams | null }>;
  /** Clique sur « Oui » dans la fenêtre de confirmation */
  confirm: () => Promise<void>;
}

export const test = base.extend<Fixtures & { _isolation: void }>({
  // Avant chaque test : base remise à zéro. Après : aucune erreur JavaScript non interceptée.
  _isolation: [
    async ({ page }, use) => {
      resetDatabase();
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use();
      expect(errors, "erreurs JavaScript dans la page").toEqual([]);
    },
    { auto: true },
  ],

  loginAs: async ({ context, baseURL }, use) => {
    await use(async (role) => {
      const user = USERS[role];
      await context.addCookies([{ name: "user_token", value: user.token, domain: new URL(baseURL!).hostname, path: "/" }]);
      await context.addInitScript((house) => {
        if (!localStorage.getItem("user_house")) localStorage.setItem("user_house", house);
        if (!localStorage.getItem("selectedLang")) localStorage.setItem("selectedLang", "fr");
      }, HOUSE.serverId);
    });
  },

  mockDiscord: async ({ page }, use) => {
    await use(async (identity, options = {}) => {
      let authorizeParams: URLSearchParams | null = null;
      await page.route("https://discord.com/oauth2/authorize?**", (route: Route) => {
        authorizeParams = new URL(route.request().url()).searchParams;
        const state = options.tamperState ? "etat-falsifie" : authorizeParams.get("state");
        const redirect = `${authorizeParams.get("redirect_uri")}#token_type=Bearer&access_token=jeton-test&state=${state}`;
        return route.fulfill({ status: 302, headers: { location: redirect } });
      });
      await page.route("https://discord.com/api/users/@me", (route) => route.fulfill({ json: { id: identity.id, username: identity.username } }));
      await page.route("https://discord.com/api/users/@me/guilds", (route) => route.fulfill({ json: identity.guilds ?? [] }));
      return { authorizeParams: () => authorizeParams };
    });
  },

  confirm: async ({ page }, use) => {
    await use(async () => {
      await page.getByRole("alertdialog").locator(".btn--primary").click();
    });
  },
});

/** Dernière notification affichée */
export function toast(page: Page) {
  return page.locator(".toast").last();
}
