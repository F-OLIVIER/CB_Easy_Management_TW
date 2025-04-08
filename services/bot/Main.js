// Fichier annexe
import { change_admin, deleteUser, getUserDiscordRole, list_admin } from "./database.js";
import { PlayerCreateOrUpdate, checkAllUser } from "./FuncData.js";
import { deleteHouse, houseExist } from "./config_house.js";
import { slash_interaction } from "./slashinteraction.js";
import { createCommands } from "./slashcommand.js";
import { cronResetMsgReaction } from "./Cronjob.js";
import { client } from "./Constant.js";
import { discordTest_chanDM, discordTest_groupAdminForum, discordTest_id, ListAdmin } from "./config.js";
import { logToFile } from "./log.js";
import { socket } from "./socket.js";

// Module nodejs et npm
import { MessageFlags, PermissionsBitField } from "discord.js";
import {} from "dotenv/config";
import { CronJob } from "cron";

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
    await deleteUser(member.guild.id, member, true);
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
  await deleteHouse(guild.id);
  console.log(`Le bot a été retiré du serveur : ${guild.name} (ID: ${guild.id})`);
});

// -------------------------------------------------------------------
// ------------------- User role est changer -------------------------
// -------------------------------------------------------------------
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.user.bot) return;
  if (await houseExist(newMember.guild.id)) {
    // Roles utilisateur
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    // Récupére les roles autorisé pour le bot sur le serveur
    const list_role = await getUserDiscordRole(newMember.guild.id);

    // Has Role user ?
    const oldHasuser = oldRoles.has(list_role.ID_Group_Users);
    const newHasuser = newRoles.has(list_role.ID_Group_Users);
    // Check if removed or added
    if (oldHasuser && !newHasuser) {
      // Role user remove
      await deleteUser(newMember.guild.id, newMember);
    } else if (!oldHasuser && newHasuser) {
      // Role user add
      await PlayerCreateOrUpdate(newMember.guild.id, newMember.user.id);
    }

    // Has Role officier ?
    const oldHasofficier = oldRoles.has(list_role.ID_Group_Officier);
    const newHasofficier = newRoles.has(list_role.ID_Group_Officier);
    if (oldHasofficier && !newHasofficier) {
      // Role officier remove
      await PlayerCreateOrUpdate(newMember.guild.id, newMember.user.id);
    } else if (!oldHasofficier && newHasofficier) {
      // Role officier add
      await PlayerCreateOrUpdate(newMember.guild.id, newMember.user.id);
    }
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

  // ! Commande réservé aux admin du Bot
  const AuthorID = message.author.id;
  if (!ListAdmin.includes(AuthorID)) return;

  const MC = message.content;

  // --------------------------------------------
  // ------------- Fonction de Test -------------
  // --------------------------------------------
  // if (MC.startsWith("!test")) {
  // }

  // --------------------------------------------
  // ----------- Création d'un admin ------------
  // --------------------------------------------
  // !create_admin_db 179655652153491456
  if (MC.startsWith("!create_admin_db")) {
    const id_new_admin = MC.replace("!create_admin_db", "").trim();
    const valid = await change_admin(id_new_admin, 1);
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
  // ----------- Création d'un admin ------------
  // --------------------------------------------
  // !list_admin_site
  if (MC.startsWith("!list_admin_site")) {
    const list = await list_admin();
    await message.reply({
      content: `<@${AuthorID}>, Liste des admin du site internet :\n${list.join("")}`,
    });
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
  // if (message.content === "!check_perms") {
  //   const botMember = await message.guild.members.fetch(client.user.id);
  //   const requiredPerms = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.UseApplicationCommands];

  //   const missingPerms = requiredPerms.filter((perm) => !botMember.permissions.has(perm));

  //   if (missingPerms.length > 0) {
  //     await message.author.send(`Missing permissions: ${missingPerms.join(", ")}`);
  //   } else {
  //     await message.author.send("All required permissions are granted.");
  //   }
  //   message.delete();
  // }
});

// --------------------------------------------------------------
// --------------------- Automatic function ---------------------
// --------------------------------------------------------------
function TaskHandle() {
  // fonction de changement automatique du message de réaction à 21h mardi et samedi
  let resetmsgreact = new CronJob(
    "0 0 21 * * 2,6",
    function () {
      cronResetMsgReaction();
    },
    null,
    true,
    "Europe/Paris"
  );
  resetmsgreact.start();
}
