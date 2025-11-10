// fichier annexe
import { CreateOrUpdateUser, deleteUser, getUserDiscordRole, isMember } from "./database.js";
import { deleteHouse, get_ID_House, list_ID_house } from "./config_house.js";
import { client } from "./Constant.js";
import { logToFile } from "./log.js";
import { adressdb, listUserBan } from "./config.js";

// module nodejs et npm
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Check l'ensemble des utilisateur (pour le demarrage du bot Discord, mise à jour aprés un arret server)
export async function checkAllUser() {
  const list_discord_server = await list_ID_house();

  for (const ID_Server of list_discord_server) {
    const serv = client.guilds.cache.get(ID_Server);

    if (!serv) {
      logToFile(`Serveur introuvable : ${ID_Server}, suppression de la db.`, "errors_bot.log");

      const db = await open({
        filename: adressdb,
        driver: sqlite3.Database,
      });

      try {
        await deleteHouse(db, ID_Server);
        logToFile(`Le bot a été retiré du serveur : ${guild.name} (ID: ${guild.id})`);
      } catch (err) {
        logToFile(`Erreur checkAllUser ${guild.name} (ID: ${guild.id})`, "errors_bot.log");
        throw err;
      } finally {
        await db.close();
      }
      continue;
    }

    try {
      const members = await serv.members.fetch();

      for (const member of members.values()) {
        if (!member.user.bot) {
          await PlayerCreateOrUpdate(ID_Server, member.user.id);
        }
      }
    } catch (err) {
      logToFile(`Erreur lors de la récupération des membres pour ${ID_Server} (checkAllUser) :\n${err}`, "errors_bot.log");
    }
  }
}

//  Création des utilisateur dans la db suite a la création d'une maison si un role déja existant est crée
export async function createUserOneDiscord(ID_Server) {
  try {
    const serv = client.guilds.cache.get(ID_Server);
    const members = await serv.members.fetch();

    for (const member of members.values()) {
      if (!member.user.bot) {
        await PlayerCreateOrUpdate(ID_Server, member.user.id);
      }
    }
  } catch (err) {
    logToFile(`Erreur lors de la récupération des membres pour ${ID_Server} (createUserOneDiscord) :\n${err}`, "errors_bot.log");
  }
}

// fonction de creation et de mise a jour d'un utilisateur de la base de donnée lowdb
export async function PlayerCreateOrUpdate(ServerID, MemberID) {
  if (await isMember(ServerID, MemberID)) {
    const serv = await client.guilds.fetch(ServerID);
    const list_role = await getUserDiscordRole(ServerID);
    const guildMember = await serv.members.fetch(MemberID);
    let allListRole = [];
    guildMember.roles.cache.forEach((role) => {
      allListRole.push(role.id);
    });

    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
    });

    try {
      let CreateOrUpdateinDB = false;
      // check de la liste des roles discord pour garder le plus élevé pour les permissions du site internet
      let MemberRole = "";
      if (listUserBan.includes(MemberID)) {
        await deleteUser(db, ServerID, MemberID);
        return;
      } else if (allListRole.includes(list_role.ID_Group_Officier)) {
        MemberRole = "Officier";
        CreateOrUpdateinDB = true;
      } else if (allListRole.includes(list_role.ID_Group_Users)) {
        MemberRole = "Membre";
        CreateOrUpdateinDB = true;
      } else {
        await deleteUser(db, ServerID, MemberID);
        return;
      }

      if (CreateOrUpdateinDB) {
        const id_house = await get_ID_House(ServerID);

        let discordPhoto = "./img/noavatar.jpg";
        if (guildMember.user.avatarURL() != null && guildMember.user.avatarURL() != undefined) {
          discordPhoto = guildMember.user.avatarURL();
        }
        const data = {
          DiscordID: MemberID,
          DiscordName: guildMember.displayName,
          DiscordBaseName: guildMember.user.username,
          DiscordRole: MemberRole,
          DiscordPhoto: discordPhoto,
          ID_Server: ServerID,
          ID_House: id_house,
        };

        if (id_house != 0) {
          await CreateOrUpdateUser(db, data);
        }
      }
    } catch (err) {
      logToFile(`PlayerCreateOrUpdate utilisateur : ${MemberID}, serveur ${ServerID} :\n${err.message}`, "errors_bot.log");
      throw err;
    } finally {
      await db.close();
    }
  }
}
