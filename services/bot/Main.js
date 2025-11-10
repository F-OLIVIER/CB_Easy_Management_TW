// Fichier annexe
import { adressdb, discordTest_chanDM, discordTest_groupAdminForum, discordTest_id, ListAdmin } from "./config.js";
import { cronCleanDB, cronDesactivateButtonMsgreact, cronListNoInscrip, cronRecallTw, cronResetMsgReaction } from "./Cronjob.js";
import { change_admin, deleteUser, getUserDiscordRole, list_admin } from "./database.js";
import { PlayerCreateOrUpdate, checkAllUser } from "./FuncData.js";
import { deleteHouse, houseExist } from "./config_house.js";
import { slash_interaction } from "./slashinteraction.js";
import { createCommands } from "./slashcommand.js";
import { client } from "./Constant.js";
import { logToFile } from "./log.js";
import { socket } from "./socket.js";

// Module nodejs et npm
import { PermissionsBitField } from "discord.js";
import {} from "dotenv/config";
import { CronJob } from "cron";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Connexion du client et gestion d'erreur
client.login(process.env.TOKEN);
client.on("error", (error) => {
  console.error("\nUne erreur est survenue :\n", error);
  logToFile(`Erreur BOT DISCORD :\n${error}`, "errors_bot.log");
});
// client.on('debug', (message) => { console.debug('\nMessage de débogage :\n', message); });
client.on("warn", (warning) => {
  console.warn("\nAvertissement :\n", warning);
});

// --------------------------------------------------------------
// ----------------------- Activation bot -----------------------
// --------------------------------------------------------------

// definition des chan utilisé par le bot
client.on("ready", async () => {
  console.log(`╭─────────────────────────────────────────────────╮
│         Bot starting up, please wait ...        │
│─────────────────────────────────────────────────│`);
  await createCommands();
  console.log("│ • Create db user in process                     │");
  await checkAllUser();
  console.log("│ • Initializing automatic function               │");
  TaskHandle();
  console.log("│ • Initializing golang communication             │");
  socket();
  console.log(`│─────────────────────────────────────────────────│
│               Start-up completed                │
│                   Bot ready !                   │
╰─────────────────────────────────────────────────╯\n`);

  logToFile(`
╭─────────────────────────────────────────────────╮
│                 Bot is started                  │
╰─────────────────────────────────────────────────╯`);
});

// -------------------------------------------------------------------
// ----------------------- User leave discord ------------------------
// -------------------------------------------------------------------
client.on("guildMemberRemove", async (member) => {
  if (member.user.bot) return;
  // console.log(`${member.user.username} a quitté le serveur.`);
  if (await houseExist(member.guild.id)) {
    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
    });

    try {
      await deleteUser(db, member.guild.id, member, true);
    } catch (err) {
      logToFile(
        `Impossible de supprimer l'utilisateur (guildMemberRemove) ${member.user.displayName} (${member.user.username})(ID: ${member.user.id}) de la guilde ${member.guild.id}`,
        "errors_bot.log"
      );
      throw err;
    } finally {
      await db.close();
    }
  }
});

// -------------------------------------------------------------------
// ---------------- User connected chan discord ----------------------
// -------------------------------------------------------------------
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.member.user.bot) return;

  if (newState.channel && (await houseExist(newState.guild.id))) {
    await PlayerCreateOrUpdate(newState.guildId, newState.member.user.id);
  }
});

// -------------------------------------------------------------------
// ------------------ Bot kick or ban discord ------------------------
// -------------------------------------------------------------------
client.on("guildDelete", async (guild) => {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    await deleteHouse(db, guild.id);
    logToFile(`Le bot a été retiré du serveur : ${guild.name} (ID: ${guild.id})`);
  } catch (err) {
    logToFile(`Erreur guildDelete ${guild.name} (ID: ${guild.id})`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
});

// -------------------------------------------------------------------
// ------------------- User role est changer -------------------------
// -------------------------------------------------------------------
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.user.bot) return;
  if (!(await houseExist(newMember.guild.id))) return;

  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;

  const list_role = await getUserDiscordRole(newMember.guild.id);

  const hasUserRole = newRoles.has(list_role.ID_Group_Users);
  const hasOfficierRole = newRoles.has(list_role.ID_Group_Officier);

  // Si l'utilisateur n'a aucun des deux rôles, on le supprime de la db
  if (!hasUserRole && !hasOfficierRole) {
    const db = await open({ filename: adressdb, driver: sqlite3.Database });
    try {
      await deleteUser(db, newMember.guild.id, newMember);
    } catch (err) {
      logToFile(`Impossible de supprimer l'utilisateur ${newMember.user.tag} de la guilde ${newMember.guild.id}`, "errors_bot.log");
      throw err;
    } finally {
      await db.close();
    }
  } else {
    // Sinon on crée ou met à jour l'utilisateur
    await PlayerCreateOrUpdate(newMember.guild.id, newMember.user.id);
  }
});

// --------------------------------------------------------------
// -------------------- Interaction command ---------------------
// --------------------------------------------------------------
// Cache d'intéraction pur les configs house
export const interactionsCache = new Map();

client.on("interactionCreate", async (interaction) => {
  slash_interaction(interaction);
});

// --------------------------------------------------------------
// ---------------------- Message command -----------------------
// --------------------------------------------------------------
client.on("messageCreate", async (message) => {
  // ! Bot refusé
  if (message.author.bot) return;

  // ! Message privée envoyé par un utilisateur au bot
  if (message.channel.type === 1) {
    const guild = client.guilds.cache.get(discordTest_id);
    const channel = guild.channels.cache.get(discordTest_chanDM);

    if (channel && channel.isTextBased()) {
      await channel.send({
        content: `<@&${discordTest_groupAdminForum}>\n📩 Message privé de **${message.author.tag}** \`${message.author.id}\` :\n\n${message.content}`,
      });
    }
  }

  const MC = message.content;
  const AuthorID = message.author.id;

  // ! Commande réservé aux admin du Bot
  if (!ListAdmin.includes(AuthorID)) return;

  // ! Liste des admin du Bot
  if (MC.startsWith("!list_admin_site")) {
    const list = await list_admin();
    await message.reply({
      content: `<@${AuthorID}>, Liste des admin du site internet :\n${list.join("")}`,
    });
    await message.delete();
  }

  // --------------------------------------------
  // ------------- Fonction de Test -------------
  // --------------------------------------------
  if (MC.startsWith("!test")) {
    console.log("--- TEST ---");
    console.log("-------------------");
  }

  // --------------------------------------------
  // ----------- Création d'un admin ------------
  // --------------------------------------------
  // !create_admin_db 179655652153491456
  if (MC.startsWith("!create_admin_db")) {
    const id_new_admin = MC.replace("!create_admin_db", "").trim();
    const valid = await change_admin(id_new_admin, 1);
    if (MC.startsWith("!list_admin_site")) {
      const list = await list_admin();
      await message.reply({
        content: `<@${AuthorID}>, Liste des admin du site internet :\n${list.join("")}`,
      });
      await message.delete();
    }

    // --------------------------------------------
    // ----------- Supression d'un admin ----------
    // --------------------------------------------
    if (valid) {
      await message.reply({
        content: `<@${AuthorID}>, admin ajouté`,
      });
    } else {
      await message.reply({
        content: `<@${AuthorID}>, Erreur`,
      });
    }
    await message.delete();
  }

  // --------------------------------------------
  // ---------- Supression d'un admin -----------
  // --------------------------------------------
  // !delete_admin_db 179655652153491456
  if (MC.startsWith("!delete_admin_db")) {
    const id_admin_to_delete = MC.replace("!delete_admin_db", "").trim();
    const valid = change_admin(id_admin_to_delete, 0);
    if (valid) {
      await message.reply({
        content: `<@${AuthorID}>, admin supprimé`,
      });
    } else {
      await message.reply({
        content: `<@${AuthorID}>, Erreur`,
      });
    }
    await message.delete();
  }

  // --------------------------------------------
  // permet de vérifier les autorisations du bot
  // --------------------------------------------
  // !check_perms
  if (message.content === "!check_perms") {
    const botMember = await message.guild.members.fetch(client.user.id);
    const requiredPerms = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.UseApplicationCommands];

    const missingPerms = requiredPerms.filter((perm) => !botMember.permissions.has(perm));

    if (missingPerms.length > 0) {
      await message.author.send(`Missing permissions: ${missingPerms.join(", ")}`);
    } else {
      await message.author.send("All required permissions are granted.");
    }
    message.delete();
  }
});

// --------------------------------------------------------------
// --------------------- Automatic function ---------------------
// --------------------------------------------------------------
function TaskHandle() {
  //  ┌───────────── second (0)
  //  │ ┌───────────── minute (0)
  //  │ │ ┌───────────── hour (20)
  //  │ │ │  ┌───────────── day of month (*)
  //  │ │ │  │ ┌───────────── month (*)
  //  │ │ │  │ │ ┌───────────── day of week (1,5)
  //  │ │ │  │ │ │
  //  0 0 20 * * 1,5

  // fonction de rappel automatique d'inscription aux TW à 20h lundi et vendredi
  let recallTw = new CronJob(
    "0 0 20 * * 1,5",
    async function () {
      await cronRecallTw();
    },
    null,
    true,
    "Europe/Paris"
  );
  recallTw.start();

  // fonction de désactivation automatique des button du message de réaction à 17h mardi et samedi
  let desactivateButtonMsgreact = new CronJob(
    "0 0 17 * * 2,6",
    async function () {
      await cronDesactivateButtonMsgreact();
      await cronListNoInscrip();
    },
    null,
    true,
    "Europe/Paris"
  );
  desactivateButtonMsgreact.start();

  // fonction de changement automatique du message de réaction à 21h mardi et samedi
  let resetMsgreact = new CronJob(
    "0 0 4 * * 3,0",
    async function () {
      await cronResetMsgReaction();
    },
    null,
    true,
    "Europe/Paris"
  );
  resetMsgreact.start();

  // fonction de nettoyage de la DB à 16h mardi et samedi
  let cleanDB = new CronJob(
    "0 0 16 * * 1,5",
    async function () {
      await cronCleanDB();
    },
    null,
    true,
    "Europe/Paris"
  );
  cleanDB.start();
}
