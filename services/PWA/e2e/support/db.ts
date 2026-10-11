// Accès direct à la base de test : remise à zéro entre les tests et vérifications.
import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { DB_FILE, SEED_DB_FILE } from "./env";

/**
 * Remet la base dans son état initial. Le backend ouvre la base à chaque requête :
 * remplacer le fichier suffit, sans redémarrer le conteneur.
 */
export function resetDatabase(): void {
  for (const suffix of ["-journal", "-wal", "-shm"]) fs.rmSync(DB_FILE + suffix, { force: true });
  fs.copyFileSync(SEED_DB_FILE, DB_FILE);
}

type Row = Record<string, unknown>;

export function queryAll<T extends Row = Row>(sql: string, ...params: (string | number)[]): T[] {
  const db = new DatabaseSync(DB_FILE, { readOnly: true });
  try {
    return db.prepare(sql).all(...params) as T[];
  } finally {
    db.close();
  }
}

/** Prépare des données propres à un test (la base est remise à zéro avant le test suivant) */
export function execute(sql: string, ...params: (string | number)[]): void {
  const db = new DatabaseSync(DB_FILE, { enableForeignKeyConstraints: false });
  try {
    db.prepare(sql).run(...params);
  } finally {
    db.close();
  }
}

export function queryOne<T extends Row = Row>(sql: string, ...params: (string | number)[]): T | undefined {
  return queryAll<T>(sql, ...params)[0];
}
