// Constantes partagées par la configuration Playwright, le setup global et les tests.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const PWA_DIR = path.resolve(here, "../..");
export const SITE_DIR = path.resolve(PWA_DIR, "../site");
export const DATABASE_SCRIPTS_DIR = path.resolve(PWA_DIR, "../database");

/** Dossier de travail partagé avec le conteneur du backend (ignoré par git) */
export const WORK_DIR = path.join(PWA_DIR, "e2e/.work");
export const DB_DIR = path.join(WORK_DIR, "database");
export const DB_FILE = path.join(DB_DIR, "databaseGvG.db");
export const SEED_DB_FILE = path.join(WORK_DIR, "seed.db");
export const WEAPON_DIR = path.join(WORK_DIR, "weapon");

/** Backend Go de test : conteneur site-e2e (voir docker-compose.e2e.yml) */
export const BACKEND_URL = process.env.E2E_BACKEND_URL || "http://127.0.0.1:9180";
/** PWA de test, servie par Vite dans le même conteneur que le navigateur */
export const PWA_PORT = Number(process.env.E2E_PWA_PORT || 9182);
export const BASE_URL = `http://localhost:${PWA_PORT}`;
/** PWA de production (conteneur pwa-e2e : build + Nginx), pour les tests de sécurité */
export const PROD_URL = process.env.E2E_PROD_URL || "http://pwa-e2e";

/** Discord ID du propriétaire : lu dans le config.go de l'image de test (source unique) */
export const OWNER_DISCORD_ID = /const OWNER = "(\d+)"/.exec(fs.readFileSync(path.join(PWA_DIR, "e2e/docker/config.e2e.go"), "utf8"))![1];
export const DISCORD_CLIENT_ID = "100000000000000000";
