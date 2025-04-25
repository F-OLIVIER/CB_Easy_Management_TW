// Import node modules
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

// Fichiers annexe
import { createDb } from './database.js';

export let db_test;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const testDbPath = path.join(__dirname, '../../database/databaseTest.db');
const scriptsFolder = path.join(__dirname, '../../database');

beforeAll(async () => {
  await createDb(testDbPath, scriptsFolder);

  db_test = await open({
    filename: testDbPath,
    driver: sqlite3.Database
  });
});

afterAll(async () => {
  if (db_test) {
    await db_test.close();
  }

  try {
    await fs.unlink(testDbPath);
    console.log('Base de test supprimée.');
  } catch (err) {
    console.error('Erreur suppression DB test :', err.message);
  }
});
