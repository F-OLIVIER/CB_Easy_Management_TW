// Fichier annexe
import { msgreactgvg } from "./Embed_gvg.js";
import { Resetac } from "./FuncRaid.js";
import { adressdb } from "./config.js";
import { client } from "./Constant.js";
import { logToFile } from "./log.js";
import { loadTranslations } from "./language.js";

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
    logToFile(`Erreur lors du cronjob reset TW (cronResetMsgReaction) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

// Fonction de rappel automatique des inscriptions
export async function cronRecallTw() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });

  const translate_fr = await loadTranslations("fr");
  const translate_en = await loadTranslations("en");

  try {
    const rows_house = await db.all(`SELECT ID, ID_Server, ID_Chan_Users, ID_Chan_GvG, Langage FROM Houses WHERE Allumage = 0 AND Recall_GvG = 1;`);
    if (!rows_house || rows_house.length === 0) return;

    for (const house of rows_house) {
      const query_users = `SELECT DiscordID FROM Users WHERE ID_House = ? AND EtatInscription = 0;`;
      const rows_users = await db.all(query_users, [house.ID]);
      if (!rows_users || rows_users.length === 0) continue;

      const chan = client.channels.cache.get(house.ID_Chan_Users);
      if (!chan) {
        logToFile(`Chan ${house.ID_Chan_Users} innexistant sur le serveur ${house.ID_Server}`, "errors_bot.log");
        continue;
      }
      if (!chan.permissionsFor(client.user)?.has(["SendMessages"])) {
        logToFile(`Le bot n'a pas la permission d'envoyer des messages dans ${house.ID_Chan_Users}`, "errors_bot.log");
        continue;
      }

      const listping = rows_users.map((u) => u.DiscordID).join(">, <@");
      if (house.Langage == "fr") {
        chan.send(`<@${listping}>\n${translate_fr.recallTW} <#${house.ID_Chan_GvG}>`);
      } else {
        chan.send(`<@${listping}>\n${translate_en.recallTW} <#${house.ID_Chan_GvG}>`);
      }
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob Recall TW (cronRecallTw) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}
