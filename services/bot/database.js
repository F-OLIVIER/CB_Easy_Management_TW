// Fichier annexe
import { client, msgChanDiscord, UserLeave } from "./Constant.js";
import { get_houseData, get_ID_House } from "./config_house.js";
import { loadTranslations } from "./language.js";
import { msgreactgvg } from "./Embed_gvg.js";
import { ResetHousesc } from "./FuncRaid.js";
import { adressdb } from "./config.js";
import { logToFile } from "./log.js";

// module nodejs et npm
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function CreateOrUpdateUser(data) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const sql = "SELECT DiscordID FROM Users WHERE DiscordID = ? AND ID_House = ?";
    const rows = await db.all(sql, [data.DiscordID, data.ID_House]);

    if (rows.length > 0) {
      // Mise à jour de l'utilisateur existant
      const updateQuery = `UPDATE Users 
                           SET DiscordName = ?, DiscordBaseName = ?, DiscordRole = ?, DiscordPhoto = ? 
                           WHERE DiscordID = ? AND ID_House = ?;`;
      await db.run(updateQuery, [data.DiscordName, data.DiscordBaseName, data.DiscordRole, data.DiscordPhoto, data.DiscordID, data.ID_House]);
    } else {
      // Création d'un nouvel utilisateur
      const houseData = await get_houseData(data.ID_Server);

      const insertQuery = `INSERT INTO Users 
                          (ID_House, DiscordID, DiscordName, DiscordBaseName, DiscordRole, DiscordPhoto, EtatInscription, userLangage) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const result_user = await db.run(insertQuery, [
        houseData.ID,
        data.DiscordID,
        data.DiscordName,
        data.DiscordBaseName,
        data.DiscordRole,
        data.DiscordPhoto,
        -1, // EtatInscription
        houseData.Langage,
      ]);

      // Création des lignes de l'utilisateur dans les tables de maison
      const userId = result_user.lastID;
      await db.run(`INSERT INTO Caserne${houseData.ID} (User_ID) VALUES (?);`, [userId]);
      await db.run(`INSERT INTO CaserneMaitrise${houseData.ID} (User_ID) VALUES (?);`, [userId]);

      const translate = await loadTranslations(houseData.Langage);

      msgChanDiscord(houseData.ID_Group_Officier, houseData.ID_Chan_Gestion, `${translate.information.UserJoinGroup[1]} <@${data.DiscordID}> ${translate.information.UserJoinGroup[2]}`);
    }
  } catch (err) {
    logToFile(`Erreur dans CreateOrUpdateUser :\n${err.message}`, "errors_bot.log");
  } finally {
    await db.close();
  }
}

export async function userInfo(ServerID, user_id) {
  const id_house = await get_ID_House(ServerID);

  try {
    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY, // Mode lecture seule
    });

    const selectQuery = `
        SELECT Users.DiscordID, Users.DiscordName, Users.DiscordRole,
              Users.Lvl, Users.Influence, Users.EtatInscription, 
              Users.NbGvGParticiped, Users.NbTotalGvG, Users.userLangage,
              CASE
                  WHEN Users.userLangage = 'fr' THEN Users.DateLastGvGParticiped_FR
                  WHEN Users.userLangage = 'en' THEN Users.DateLastGvGParticiped_EN
                  ELSE Users.DateLastGvGParticiped_EN
              END AS DateLastGvGParticiped,  
              CASE
                  WHEN Users.userLangage = 'fr' THEN COALESCE(ListGameCharacter.ClasseFR, 0)
                  WHEN Users.userLangage = 'en' THEN COALESCE(ListGameCharacter.ClasseEN, 0)
                  ELSE COALESCE(ListGameCharacter.ClasseEN, 0)
              END AS Classe
        FROM Users
        LEFT JOIN ListGameCharacter ON ListGameCharacter.ID = Users.GameCharacter_ID
        WHERE Users.DiscordID = ? AND Users.ID_House = ?;
      `;

    const row = await db.get(selectQuery, [user_id, id_house]);
    await db.close();

    return row || null; // Retourne `null` si aucun utilisateur trouvé
  } catch (err) {
    logToFile(`Erreur lors de la récupération des infos utilisateur (userInfo) :\n ${err.message}`, "errors_bot.log");
    throw err;
  }
}

// ------------------------------------------------------------
// ----------------- Fonction de test booléan -----------------
// ------------------------------------------------------------
export async function isMember(ServerID, MemberID) {
  try {
    const list_role = await getUserDiscordRole(ServerID);
    if (!list_role) return false;

    const serv = await client.guilds.fetch(ServerID);
    if (!serv) return false;

    const guildMember = await serv.members.fetch(MemberID);
    if (!guildMember) return false;

    return guildMember.roles.cache.some((role) => role.id === list_role.ID_Group_Users || role.id === list_role.ID_Group_Officier);
  } catch (err) {
    logToFile(`Erreur dans isMember(${ServerID}, ${MemberID}) :\n${err.message}`, "errors_bot.log");
    return false;
  }
}

export async function isOfficier(ServerID, AuthorID) {
  try {
    const id_house = await get_ID_House(ServerID);
    if (!id_house) return false;

    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY, // Mode lecture seule
    });

    const requestQuery = `SELECT DiscordRole FROM Users WHERE DiscordID = ? AND ID_House = ?;`;
    const row = await db.get(requestQuery, [AuthorID, id_house]);

    await db.close();

    return row?.DiscordRole === "Officier";
  } catch (err) {
    logToFile(`Erreur lors de la récupération du rôle (isOfficier) :\n ${err.message}`, "errors_bot.log");
    return false;
  }
}

// ------------------------------------------------------------
// --------------- mise à jour de l'utilisateur ---------------
// ------------------------------------------------------------
export async function updateclass(ID_Server, AuthorID, GameCharacter_ID) {
  try {
    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
    });

    let id_house = await get_ID_House(ID_Server);
    const updateQuery = `UPDATE Users SET GameCharacter_ID = ? WHERE DiscordID = ? AND Users.ID_House = ?;`;
    await db.run(updateQuery, [GameCharacter_ID, AuthorID, id_house]);
    await db.close();

    return true;
  } catch (err) {
    logToFile(`Erreur lors de la mise à jour de la classe de ${AuthorID} :\n ${err.message}`, "errors_bot.log");
    return false;
  } finally {
  }
}

export async function updateLvl(ID_Server, AuthorID, lvl) {
  const id_house = await get_ID_House(ID_Server);

  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET Lvl = ? WHERE DiscordID = ? AND Users.ID_House = ?;`;
    await db.run(updateQuery, [lvl, AuthorID, id_house]);
    await db.close();
    return true;
  } catch (err) {
    logToFile(`Erreur lors de la mise à jour du niveau de ${AuthorID} :\n ${err.message}`, "errors_bot.log");
    await db.close();
    return false;
  } finally {
  }
}

export async function updateInflu(ID_Server, AuthorID, influ) {
  const id_house = await get_ID_House(ID_Server);

  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET Influence = ? WHERE DiscordID = ? AND Users.ID_House = ?;`;
    await db.run(updateQuery, [influ, AuthorID, id_house]);
    await db.close();

    return true;
  } catch (err) {
    logToFile(`Erreur lors de la mise à jour de l'influence ${AuthorID} :\n ${err.message}`, "errors_bot.log");
    await db.close();
    return false;
  }
}

export async function deleteUser(ID_Server, member, leaveDiscord = false) {
  const id_house = await get_ID_House(ID_Server);

  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const selectUserQuery = `
        SELECT Users.ID, Users.ID_House, Users.DiscordName, Houses.ID_Chan_Gestion, Houses.Langage
        FROM Users
        INNER JOIN Houses ON Users.ID_House = Houses.ID
        WHERE Users.DiscordID = ? AND Users.ID_House = ?;
      `;

    const row = await db.get(selectUserQuery, [member.user.id, id_house]);

    if (row) {
      // console.log(`Utilisateur ${row.DiscordName} supprimé, ID : ${member.user.id}`);.
      const translate = await loadTranslations(row.Langage);
      if (leaveDiscord) {
        UserLeave(row.ID_Chan_Gestion, member.user.displayName, member.user.username, translate.information.UserLeaveDiscord);
      } else {
        UserLeave(row.ID_Chan_Gestion, member.user.displayName, member.user.username, translate.information.UserLeaveGroupDiscord);
      }

      const userID = row.ID;
      // Suppression de l'utilisateur des table de la maison auquel il appartient
      const listQuery = [
        `DELETE FROM Caserne${userID} WHERE User_ID = ?;`,
        `DELETE FROM CaserneMaitrise${userID} WHERE User_ID = ?;`,
        `DELETE FROM GroupGvG${userID} WHERE User_ID = ?;`,
        `DELETE FROM GroupTypeAtt${userID} WHERE User_ID = ?;`,
        `DELETE FROM GroupTypeDef${userID} WHERE User_ID = ?;`,
        `DELETE FROM Users WHERE ID = ?;`,
      ];
      // Exécuter toutes les suppressions
      for (const deleteQuery of listQuery) {
        try {
          await db.run(deleteQuery, [userID]);
        } catch (error) {
          logToFile(`Erreur suppression deleteUser (${deleteQuery}):\n ${error.message}`, "errors_bot.log");
        }
      }
    }
  } catch (err) {
    logToFile(`Erreur lors de la suppression de l'utilisateur ${member.user.id} (deleteUser) :\n${err.message}`, "errors_bot.log");
  } finally {
    await db.close();
  }
}

// ------------------------------------------------------------
// ---------- Récupération d'informations dans la DB ----------
// ------------------------------------------------------------
export async function getUserDiscordRole(ID_Server) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const requestQuery = `SELECT ID_Group_Users, ID_Group_Officier FROM Houses WHERE ID_Server = ?;`;
    const row = await db.get(requestQuery, [ID_Server]);

    if (!row) return null;
    await db.close();

    return {
      ID_Group_Users: row.ID_Group_Users,
      ID_Group_Officier: row.ID_Group_Officier,
    };
  } catch (err) {
    logToFile(`Erreur lors de la récupération des rôles (getUserDiscordRole) :\n${err.message}`, "errors_bot.log");
    await db.close();
    return null;
  } finally {
  }
}

export async function listInscription(ID_House) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const requestQueries = [
      `SELECT DiscordID FROM Users WHERE EtatInscription = 1 AND ID_House = ?;`, // List present
      `SELECT DiscordID FROM Users WHERE EtatInscription = 3 AND ID_House = ?;`, // List absent
    ];

    const playerLists = await Promise.all(requestQueries.map((query) => db.all(query, [ID_House])));
    await db.close();

    return playerLists.map((rows) => rows.map((row) => row.DiscordID));
  } catch (err) {
    logToFile(`Erreur récupération des inscrit house : ${ID_House} (listInscription) :\n ${err.message}`, "errors_bot.log");
    await db.close();
    return [];
  }
}

export async function listclass(language) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const requestQuery = `
      SELECT ID, 
             CASE 
               WHEN ? = 'fr' THEN ClasseFR 
               ELSE ClasseEN 
             END AS Classe
      FROM ListGameCharacter;
    `;

    const list = await db.all(requestQuery, [language]);
    await db.close();

    return list;
  } catch (err) {
    logToFile(`Erreur lors de la récupération des classes (listclass) :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  } finally {
  }
}

export async function cmdclass(language) {
  const list = await listclass(language);
  const options = [];
  for (let i = 0; i < list.length; i++) {
    options.push({
      label: list[i].Classe,
      value: list[i].ID.toString(),
    });
  }

  return options;
}

// ------------------------------------------------------------
// ------------- mise à jour de la gestion du bot -------------
// ------------------------------------------------------------
export function updateIdMessage(db, ID_Server, newMessageId) {
  const updateQuery = `UPDATE Houses SET ID_MessageGvG = ? WHERE ID_Server = ?;`;
  db.run(updateQuery, [newMessageId, ID_Server], function (error) {
    if (error) {
      logToFile(`Erreur (updateIdMessage) ID_Server=${ID_Server}, newMessageId=${newMessageId} :\n${err.message}`, "errors_bot.log");
      throw error;
    }
  });
}

export async function updateBotActivation(ID_Server, allumage) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Houses SET Allumage = ? WHERE ID_Server = ?;`;
    db.run(updateQuery, [allumage, ID_Server], function (error) {
      if (error) {
        logToFile(`Erreur (updateBotActivation) ID_Server=${ID_Server}, Allumage=${allumage} :\n${err.message}`, "errors_bot.log");
        throw error;
      }
    });
  } catch (err) {
    logToFile(`Erreur (updateBotActivation) ID_Server=${ID_Server}, allumage=${allumage} :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

export async function resetManuelMsgGvG(houseData) {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    await ResetHousesc(db, houseData.ID);
    await msgreactgvg(db, houseData.ID_Server, houseData.ID_MessageGvG, houseData.Langage, houseData.ID_Chan_GvG, houseData.ID_Group_Users);
  } catch (err) {
    logToFile(`Erreur lors du reset du message GvG (resetmsgGvG) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

// ------------------------------------------------------------
// ------------------ mise à jour des admin -------------------
// ------------------------------------------------------------
export async function change_admin(discord_id, newstate) {
  if (discord_id == null || newstate === null) return false;

  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const updateQuery = `UPDATE Users SET userAdmin = ? WHERE DiscordID = ?;`;
    const result = await db.run(updateQuery, [newstate, discord_id]);

    await db.close();

    return result.changes > 0;
  } catch (err) {
    logToFile(`Erreur lors du changement d'admin (change_admin) :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}

export async function list_admin() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    const selectQuery = `SELECT DiscordID, DiscordName, DiscordBaseName FROM Users WHERE userAdmin = 1;`;
    const rows = await db.all(selectQuery);
    await db.close();

    return rows.map((row) => `- ${row.DiscordName} (${row.DiscordID}, ${row.DiscordBaseName})\n`);
  } catch (err) {
    logToFile(`Erreur (list_admin) :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}
