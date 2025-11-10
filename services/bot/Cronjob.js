// Fichier annexe
import { ButtonNotActifEmbedInscription, EmbedInscription, msgreactgvg } from "./Embed_gvg.js";
import { deleteUser, getUserDiscordRole, listNoInscrip, updateHouseLogo } from "./database.js";
import { PlayerCreateOrUpdate } from "./FuncData.js";
import { deleteHouse } from "./config_house.js";
import { loadTranslations } from "./language.js";
import { Resetac } from "./FuncRaid.js";
import { adressdb } from "./config.js";
import { client } from "./Constant.js";
import { logToFile } from "./log.js";

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
        `SELECT DiscordID FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Users.EtatInscription = 1 AND Houses.ID_Server = ?;`, // List "Present"
        `SELECT DiscordID FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Users.EtatInscription = 2 AND Houses.ID_Server = ?;`, // List "En retard"
        `SELECT DiscordID FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Users.EtatInscription = 3 AND Houses.ID_Server = ?;`, // List "Absent"
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

      let lateList = [];
      if (listinscrit[1] !== undefined) {
        lateList = await Promise.all(
          listinscrit[1].map(async (id) => {
            const userId = BigInt(id);
            return "<@" + userId.toString() + ">";
          })
        );
      }

      let absentList = [];
      if (listinscrit[2] !== undefined) {
        absentList = await Promise.all(
          listinscrit[2].map(async (id) => {
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
          embeds: [await EmbedInscription(row.Langage, presentList, lateList, absentList, row.Late)],
          components: [await ButtonNotActifEmbedInscription(row.Langage, row.Late)],
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

// Fonction qui affiche les utilisateur non inscrits dans le chan gestionnaire
export async function cronListNoInscrip() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY,
  });

  try {
    const rows_house = await db.all(`SELECT ID, ID_Server, ID_Group_Officier, ID_Chan_GvG, Langage FROM Houses WHERE Allumage = 0 AND Recall_GvG = 1;`);
    if (!rows_house || rows_house.length === 0) return;

    for (const house of rows_house) {
      const listNoInscrip = await listNoInscrip(house.ID);
      if (!listNoInscrip || listNoInscrip.length === 0) continue;

      const translate = await loadTranslations(house.Langage);

      msgChanDiscord(house.ID_Group_Officier, house.ID_Chan_GvG, `${translate.listNoInscrip}\n${listNoInscrip.map((id) => `<@${id}>`).join(", ")}`);
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob listNoInscrip (cronListNoInscrip) :\n${err.message}`, "errors_bot.log");
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
    const requestQuery = `SELECT ID_Server, ID_MessageGvG, Langage, ID_Chan_GvG, ID_Group_Users, House_logo, Late FROM Houses WHERE Allumage = 0;`;
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
      await msgreactgvg(db, row.ID_Server, row.ID_MessageGvG, row.Langage, row.ID_Chan_GvG, row.ID_Group_Users, row.Late);

      // Mise à jour du logo de maison
      try {
        // Récupérer la guild
        const guild = await client.guilds.fetch(row.ID_Server);
        if (!guild) {
          logToFile(`Serveur ${row.ID_Server} introuvable.`, "errors_bot.log");
          continue;
        }

        const iconURL = guild.iconURL();
        if (iconURL && row.House_logo !== iconURL) {
          await updateHouseLogo(row.ID_Server, iconURL);
        }
      } catch (err) {
        logToFile(`Erreur lors du cronjob reset TW (cronResetMsgReaction) :\n${err.message}`, "errors_bot.log");
      }
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

      // Découpe un tableau en sous éléments
      function sub_element_Array(array, size) {
        const sub_element = [];
        for (let i = 0; i < array.length; i += size) {
          sub_element.push(array.slice(i, i + size));
        }
        return sub_element;
      }

      const userIds = rows_users.map((u) => u.DiscordID);
      const sub_list_users = sub_element_Array(userIds, 50); // par paquets de 50

      for (const list_users of sub_list_users) {
        const listping = list_users.map((id) => `<@${id}>`).join(", ");
        if (house.Langage == "fr") {
          await chan.send(`${listping}\n${translate_fr.recallTW} <#${house.ID_Chan_GvG}>`);
        } else {
          await chan.send(`${listping}\n${translate_en.recallTW} <#${house.ID_Chan_GvG}>`);
        }
      }
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob Recall TW (cronRecallTw) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

// fonction de mise a jour des utilisateurs du Discord
export async function cronCleanDB() {
  logToFile(`Demarrage du Cronjob cronCleanDB.`);
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    // Récupération de la liste des serveurs Discord
    const requestQuery = `SELECT ID_Server FROM Houses;`;
    const rows = await db.all(requestQuery);

    if (!rows || rows.length === 0) return;

    for (const row of rows) {
      // Vérification de l'existance du serveur
      const serv = client.guilds.cache.get(row.ID_Server);
      if (!serv) {
        logToFile(`Serveur introuvable : ${row.ID_Server}, suppression de la db.`, "errors_bot.log");
        await deleteHouse(db, row.ID_Server);
        continue;
      }

      try {
        // Récupération de la liste des utilisateurs dans la DB
        const playerLists = await db.all(`SELECT DiscordID, DiscordName FROM Users INNER JOIN Houses ON Users.ID_House = Houses.ID WHERE Houses.ID_Server = ?;`, [row.ID_Server]);

        // Récupération des rôles autorisés sur le serveur
        const list_role = await getUserDiscordRole(row.ID_Server);

        // Parcours séquentiel des utilisateurs
        for (const { DiscordID: dbUserId, DiscordName: dbUsername } of playerLists) {
          let member = null;

          try {
            member = await serv.members.fetch(dbUserId);
          } catch {
            member = null; // le membre n'existe plus ou fetch impossible
          }

          if (!member) {
            await deleteUser(db, row.ID_Server, { user: { username: dbUsername, id: dbUserId } }, true);
          } else {
            const hasUserRole = member.roles.cache.has(list_role.ID_Group_Users);
            const hasOfficierRole = member.roles.cache.has(list_role.ID_Group_Officier);

            if (hasUserRole || hasOfficierRole) {
              await PlayerCreateOrUpdate(row.ID_Server, member.user.id);
            } else {
              await deleteUser(db, row.ID_Server, member, true);
            }
          }
        }
      } catch (error) {
        logToFile(`Erreur lors de la récupération des membres pour ${row.ID_Server} (cronCleanDB) :\n${error}`, "errors_bot.log");
      }
    }
  } catch (err) {
    logToFile(`Erreur lors du cronjob cronCleanDB :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
    logToFile(`Cronjob cronCleanDB terminé.`);
  }
}
