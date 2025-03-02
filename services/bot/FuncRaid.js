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

export async function Resetac(db) {
  const dateformate = new Date();
  const jour = dateformate.getDate().toString().padStart(2, "0");
  const mois = (dateformate.getMonth() + 1).toString().padStart(2, "0");
  const annee = dateformate.getFullYear();
  const dateFrenchFormat = `${jour}/${mois}/${annee}`;
  const dateEnglishFormat = `${annee}/${mois}/${jour}`;

  try {
    //Mise a jour de la table User
    const updateQuery = `UPDATE Users
                      SET
                        DateLastGvGParticiped_FR = CASE
                                                  WHEN EtatInscription IN (1) THEN ?
                                                  ELSE DateLastGvGParticiped_FR
                                                END,
                        DateLastGvGParticiped_EN = CASE
                                                  WHEN EtatInscription IN (1) THEN ?
                                                  ELSE DateLastGvGParticiped_EN
                                                END,
                        NbGvGParticiped = NbGvGParticiped + CASE
                                                  WHEN EtatInscription IN (1) THEN 1
                                                  ELSE 0
                                                END,
                        EtatInscription = 0,
                        NbTotalGvG = NbTotalGvG + 1;`;

    await db.run(updateQuery, [dateFrenchFormat, dateEnglishFormat]);

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
      console.log("Aucune table GroupGvG trouvée.");
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

export async function MAJinscription(DiscordID, etatInscription) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET EtatInscription = ? WHERE DiscordID = ?;`;
    await db.run(updateQuery, [etatInscription, DiscordID]);
  } catch (err) {
    logToFile(`Erreur lors de la mise a jour de l'etat d'inscription de ${DiscordID} :\n${err.message}`, "errors_bot.log");
  } finally {
    await db.close();
  }
}
