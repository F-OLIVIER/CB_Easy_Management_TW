// Fichier annexe
import { ButtonNotActifEmbedInscription, EmbedInscription, msgreactgvg } from "./Embed_gvg.js";
import { Resetac } from "./FuncRaid.js";
import { adressdb } from "./config.js";
import { client } from "./Constant.js";
import { logToFile } from "./log.js";
import { loadTranslations } from "./language.js";

// module nodejs et npm
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// fonction de changement automatique du message de réaction à 21h mardi et samedi
export async function cronDesactivateButtonMsgreact() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });

  try {
    const requestQuery = `SELECT ID_Server, ID_Chan_GvG, ID_MessageGvG, Langage FROM Houses WHERE Allumage = 0;`;
    const rows = await db.all(requestQuery);

    if (!rows || rows.length === 0) return;

    for (const row of rows) {
      const requestQueries = [
        `SELECT DiscordID FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Users.EtatInscription = 1 AND Houses.ID_Server = ?;`, // List present
        `SELECT DiscordID FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Users.EtatInscription = 3 AND Houses.ID_Server = ?;`, // List absent
      ];
      const playerLists = await Promise.all(requestQueries.map((query) => db.all(query, [row.ID_Server])));
      const listinscrit = playerLists.map((rowslist) => rowslist.map((rowlist) => rowlist.DiscordID));

      let presentList = [];
      if (listinscrit[0] !== undefined) {
        presentList = await Promise.all(
          listinscrit[0].map(async (id) => {
            const userId = BigInt(id);
            return "<@" + userId.toString() + ">";
          })
        );
      }

      let absentList = [];
      if (listinscrit[1] !== undefined) {
        absentList = await Promise.all(
          listinscrit[1].map(async (id) => {
            const userId = BigInt(id);
            return "<@" + userId.toString() + ">";
          })
        );
      }

      const chan = await client.channels.fetch(row.ID_Chan_GvG);
      if (!chan) {
        logToFile(`Chan TW ${row.ID_Chan_GvG} innexistant pour la maison ${row.ID_Server}`, "errors_bot.log");
        continue;
      }

      // const message = await chan.messages.fetch(row.ID_MessageGvG);
      let message;
      try {
        if (!chan.viewable || !chan.permissionsFor(client.user).has("ReadMessageHistory")) {
          logToFile(`Le Bot ne peut pas accéder au chan ${row.ID_Chan_GvG}`, "errors_bot.log");
          continue;
        }

        message = await chan.messages.fetch(row.ID_MessageGvG);
      } catch (err) {
        if (err.code === 10008) {
          // Discord API: Unknown Message (message supprimer)
          logToFile(`Message introuvable (peut-être supprimé) : ${row.ID_MessageGvG} dans chan ${row.ID_Chan_GvG}`, "errors_bot.log");
          continue;
        } else {
          throw err;
        }
      }

      await message
        .edit({
          embeds: [await EmbedInscription(row.Langage, presentList, absentList)],
          components: [await ButtonNotActifEmbedInscription(row.Langage)],
        })
        .catch((err) => {
          logToFile(`Error edit Embed EmbedInscription \nhouseData : ${row.ID_Server}\n${err}`, "errors_bot.log");
        });
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob DesactivateButton TW (cronDesactivateButtonMsgreact) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

// fonction de changement automatique du message de réaction à 21h mardi et samedi
export async function cronResetMsgReaction() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const requestQuery = `SELECT ID_Server, ID_MessageGvG, Langage, ID_Chan_GvG, ID_Group_Users FROM Houses WHERE Allumage = 0;`;
    const rows = await db.all(requestQuery);

    if (!rows || rows.length === 0) return;

    const dateformate = new Date();
    const jour = dateformate.getDate().toString().padStart(2, "0");
    const mois = (dateformate.getMonth() + 1).toString().padStart(2, "0");
    const annee = dateformate.getFullYear();
    // arrayDate = Date au format [français, anglais]
    let arrayDate = [`${jour}/${mois}/${annee}`, `${annee}/${mois}/${jour}`];

    for (const row of rows) {
      await Resetac(db, arrayDate);
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
