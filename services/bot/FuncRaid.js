// Fichier annexe
import { adressdb } from "./config.js";
import { logToFile } from "./log.js";

// module nodejs et npm
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function Resetsc() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET EtatInscription = 0`;
    await db.run(updateQuery);

    await deleteGroupGvG(db);
  } catch (err) {
    logToFile(`Erreur lors du resetsc :\n${err.message}`, "errors_bot.log");
  } finally {
    await db.close();
  }
}

export async function Resetac(db, arrayDate) {
  try {
    const updateQuery = `UPDATE Users
                      SET
                        DateLastGvGParticiped_FR = CASE
                                                  WHEN EtatInscription IN (1, 2) THEN ?
                                                  ELSE DateLastGvGParticiped_FR
                                                END,
                        DateLastGvGParticiped_EN = CASE
                                                  WHEN EtatInscription IN (1, 2) THEN ?
                                                  ELSE DateLastGvGParticiped_EN
                                                END,
                        NbGvGParticiped = NbGvGParticiped + CASE
                                                  WHEN EtatInscription IN (1, 2) THEN 1
                                                  ELSE 0
                                                END,
                        EtatInscription = 0,
                        NbTotalGvG = NbTotalGvG + 1;`;

    await db.run(updateQuery, arrayDate);

    deleteGroupGvG(db);
  } catch (err) {
    logToFile(`Erreur lors du reset des données (Resetac) :\n${err.message}`, "errors_bot.log");
  }
}

export async function ResetHousesc(db, id_house) {
  try {
    // Re-initialisation de l'etat d'inscription des utilisateurs
    const updateQuery = `UPDATE Users SET EtatInscription = 0 WHERE ID_House = ?`;
    await db.run(updateQuery, [id_house]);

    // Supression des groupes GvG de la maison
    const deleteQuery = `DELETE FROM GroupGvG${id_house}`;
    await db.run(deleteQuery);
  } catch (err) {
    logToFile(`Erreur lors du ResetHousesc ${id_house} :\n${err.message}`, "errors_bot.log");
  }
}

async function deleteGroupGvG(db) {
  try {
    // Récupérer toutes les tables qui commencent par "GroupGvG"
    const tables = await db.all(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name LIKE 'GroupGvG%';
    `);

    if (tables.length === 0) {
      logToFile(`Aucune table GroupGvG trouvée (fonction deleteGroupGvG).`);
      return;
    }

    // Supprimer les données de chaque table trouvée
    for (const table of tables) {
      await db.run(`DELETE FROM ${table.name};`);
    }
  } catch (err) {
    logToFile(`Erreur lors de la suppression des données (deleteGroupeGvG) :\n ${err.message}`, "errors_bot.log");
  }
}

export async function MAJinscription(DiscordID, etatInscription, ID_House) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET EtatInscription = ? WHERE DiscordID = ? AND ID_House = ?;`;
    await db.run(updateQuery, [etatInscription, DiscordID, ID_House]);
  } catch (err) {
    logToFile(`Erreur lors de la mise a jour de l'etat d'inscription de ${DiscordID} :\n${err.message}`, "errors_bot.log");
  } finally {
    await db.close();
  }
}
