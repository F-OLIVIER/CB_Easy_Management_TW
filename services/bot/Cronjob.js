// Fichier annexe
import { msgreactgvg } from "./Embed_gvg.js";
import { Resetac } from "./FuncRaid.js";
import { adressdb } from "./config.js";

// module nodejs et npm
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// fonction de changement automatique du message de réaction à 21h mardi et samedi
export async function cronResetMsgReaction() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const requestQuery = `SELECT ID_Server, ID_MessageGvG, Langage, ID_Chan_GvG, ID_Group_Users FROM Houses WHERE Allumage = 0;`;
    const rows = await db.all(requestQuery);

    if (!rows || rows.length === 0) return; // Vérifie s'il y a des résultats

    for (const row of rows) {
      await Resetac(db);
      await msgreactgvg(db, row.ID_Server, row.ID_MessageGvG, row.Langage, row.ID_Chan_GvG, row.ID_Group_Users);
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob reset GvG (cronResetMsgReaction) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}
