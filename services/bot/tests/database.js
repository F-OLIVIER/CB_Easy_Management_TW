// Import node modules
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs/promises";

// Création d'une DB de test
export async function createDb(adressdb, pathfolderdb) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database
  });

  try {
    await executeSQLScript(db, path.join(pathfolderdb, 'script_create_table_gestion.sql'), 'Création des tables de gestion');
    await executeSQLScript(db, path.join(pathfolderdb, 'script_create_table_infogame.sql'), 'Création des tables d\'information du jeu');
    await executeSQLScript(db, path.join(pathfolderdb, 'script_create_table_forum.sql'), 'Création des tables du forum');

    await insertIfNotExists(
      db,
      `SELECT ID FROM ListTypeUnit WHERE TypeFR = 'Cavalerie'`,
      path.join(pathfolderdb, 'script_INSERT_ListTypeUnit.sql'),
      'Insertion type d’unité'
    );

    await insertIfNotExists(
      db,
      `SELECT ID FROM ListGameCharacter WHERE ClasseFR = 'Mousquet'`,
      path.join(pathfolderdb, 'script_INSERT_ListGameCharacter.sql'),
      'Insertion classe (arme)'
    );

    await insertIfNotExists(
      db,
      `SELECT ID FROM ListUnit WHERE UnitFR = 'khorchins'`,
      path.join(pathfolderdb, 'script_INSERT_ListUnit.sql'),
      'Insertion unité de base'
    );
  } finally {
    await db.close();
  }
}

async function executeSQLScript(db, filePath, context) {
  try {
    const script = await fs.readFile(filePath, 'utf-8');
    await db.exec(script);
  } catch (err) {
    console.error(`${context} - ERREUR :`, err.message);
    throw err;
  }
}

async function insertIfNotExists(db, checkQuery, scriptPath, context) {
  try {
    const row = await db.get(checkQuery);
    if (!row) {
      const script = await fs.readFile(scriptPath, 'utf-8');
      await db.exec(script);
    }
  } catch (err) {
    console.error(`${context} - ERREUR :`, err.message);
    throw err;
  }
}