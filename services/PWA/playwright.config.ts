import { defineConfig, devices } from "@playwright/test";
import { BACKEND_URL, BASE_URL, DISCORD_CLIENT_ID, PROD_URL, PWA_PORT } from "./e2e/support/env";

// Tests e2e de la PWA (serveur Vite) contre le vrai backend Go sur une base de test générée.
// Exécution normale : e2e/docker/run.sh (tout tourne dans des conteneurs).
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.work/results",
  globalSetup: "./e2e/support/global-setup.ts",
  // Un seul worker : les tests partagent la base et le backend limite le débit (5 requêtes/s)
  workers: 1,
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "e2e/.work/report", open: "never" }]],
  use: {
    baseURL: BASE_URL,
    locale: "fr-FR",
    // Pas de service worker : chaque test part d'un navigateur vierge
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /(^|\/)(mobile|security)\.spec\.ts$/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
    // Image de production (Nginx) : en-têtes de sécurité, CSP, et protections du backend derrière le vrai proxy
    { name: "prod", use: { ...devices["Desktop Chrome"], baseURL: PROD_URL }, testMatch: /(^|\/)(backend-)?security\.spec\.ts$/ },
  ],
  webServer: {
    command: `npx vite --port ${PWA_PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      BACKEND_URL,
      PWA_PORT: String(PWA_PORT),
      VITE_DISCORD_CLIENT_ID: DISCORD_CLIENT_ID,
      VITE_DISCORD_REDIRECT_URI: `${BASE_URL}/discord`,
      VITE_LINK_INVITE_BOT: "https://discord.com/oauth2/authorize?client_id=" + DISCORD_CLIENT_ID,
    },
  },
});
