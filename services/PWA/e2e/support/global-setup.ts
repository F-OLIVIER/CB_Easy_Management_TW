// Prépare la base de test partagée avec le backend (conteneur site-e2e) et attend qu'il réponde.
// Rien ne touche à la base réelle ni aux images du projet : tout vit dans e2e/.work.
import fs from "node:fs";
import path from "node:path";
import { BACKEND_URL, DATABASE_SCRIPTS_DIR, DB_DIR, SEED_DB_FILE, SITE_DIR, WEAPON_DIR } from "./env";
import { resetDatabase } from "./db";
import { buildSeedDatabase } from "./seed";

/** Vide un dossier sans le supprimer : il est monté tel quel dans le conteneur du backend */
function emptyDirectory(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
  for (const entry of fs.readdirSync(dir)) fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
}

async function waitForBackend(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BACKEND_URL}/`)).ok) return;
    } catch {
      // pas encore prêt
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Backend de test injoignable (${BACKEND_URL}) après ${timeoutMs / 1000} s : lancer les tests avec e2e/docker/run.sh.`);
}

export default async function globalSetup(): Promise<void> {
  // Scripts SQL exécutés par le backend au démarrage (création des tables si absentes)
  fs.mkdirSync(DB_DIR, { recursive: true });
  for (const file of fs.readdirSync(DATABASE_SCRIPTS_DIR).filter((name) => name.endsWith(".sql"))) {
    fs.copyFileSync(path.join(DATABASE_SCRIPTS_DIR, file), path.join(DB_DIR, file));
  }
  buildSeedDatabase(SEED_DB_FILE);
  resetDatabase();

  // Images d'armes : copie modifiable (test d'envoi d'image depuis l'administration)
  emptyDirectory(WEAPON_DIR);
  fs.cpSync(path.join(SITE_DIR, "public/img/weapon"), WEAPON_DIR, { recursive: true });

  // Le démarrage du backend inclut l'obfuscation du JavaScript de l'ancien site
  await waitForBackend(180_000);
}
