// fichier annexe
import { discordTest_chanDM, discordTest_groupAdminForum } from "./config.js";
import { logToFile } from "./log.js";

// Module nodejs et npm
import { Client, GatewayIntentBits, MessageFlags, Partials } from "discord.js";

// Clients Discord
export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // Permet au bot de recevoir des événements liés aux serveurs (guilds).
    GatewayIntentBits.GuildMessages, // Permet au bot de recevoir les messages envoyés dans les salons textuels d'un serveur.
    GatewayIntentBits.MessageContent, // permet au bot de lire le contenu des messages envoyés dans les salons textuels.
    GatewayIntentBits.GuildMembers, // Permet au bot de recevoir les ajouts, suppressions et mises à jour des membres d'un serveur (⚠️ doit être activé sur le portail Discord).
    GatewayIntentBits.GuildVoiceStates, // Permet au bot de suivre les connexions, déconnexions et changements d'état des membres dans les salons vocaux.
    GatewayIntentBits.DirectMessages, // Capter les message privée envoyer au bot
  ],
  partials: [
    Partials.Message, // Permet d’accéder aux messages supprimés ou non mis en cache.
    Partials.Channel, // Permet d'accéder au DM
  ],
});

// Réponse d'interaction à l'utilisateur
export async function reponseUserInteraction(interaction, msg) {
  await interaction.reply({
    content: "<@" + interaction.user.id + ">\n" + msg,
    flags: MessageFlags.Ephemeral,
  });
}

// Log dans un chan Discord (chan utilisateur ou chan de gestion)
export function msgChanDiscord(ID_Group, ID_Chan, msg) {
  const chan = client.channels.cache.get(ID_Chan);
  if (!chan) {
    logToFile(`Chan ${ID_Chan} innexistant`, "errors_bot.log");
    return;
  }
  if (!chan.permissionsFor(client.user)?.has(["SendMessages", "AttachFiles", "EmbedLinks"])) {
    logToFile(`Le bot n'a pas la permission d'envoyer des messages dans ${ID_Chan}`, "errors_bot.log");
    return;
  }
  chan.send("<@&" + ID_Group + ">\n" + msg);
}

// Message utilisateur retirer de la database
export function UserLeave(ID_Chan_Gestion, name, nickname, msg) {
  const chan = client.channels.cache.get(ID_Chan_Gestion);
  if (!chan) {
    logToFile(`Chan ${ID_Chan_Gestion} innexistant`, "errors_bot.log");
    return;
  }
  if (!chan.permissionsFor(client.user)?.has(["SendMessages", "AttachFiles", "EmbedLinks"])) {
    logToFile(`Le bot n'a pas la permission d'envoyer des messages dans ${ID_Chan_Gestion}`, "errors_bot.log");
    return;
  }
  chan.send(name + " (" + nickname + ") " + msg);
}

export async function sendPrivateMsg(userId, msg = "") {
  const user = await client.users.fetch(userId);
  try {
    await user.send(msg);
    msgChanDiscord(discordTest_groupAdminForum, discordTest_chanDM, `:white_check_mark: Reply to : **${user.globalName}** (${userId})\n${msg}`);
  } catch (error) {
    msgChanDiscord(discordTest_groupAdminForum, discordTest_chanDM, `:x: Reply to : **${user.globalName}** (${userId})\n${error}`);
    logToFile(`Impossible d'envoyer un MP à ${user.username} :\n${error}`, "errors_bot.log");
  }
}

export async function verif_perm_channel(ID_Chan) {
  const chan = client.channels.cache.get(ID_Chan);

  const permissionsNeeded = ["ViewAuditLog", "SendMessages", "EmbedLinks", "AttachFiles", "ManageMessages", "ReadMessageHistory", "Connect", "UseApplicationCommands"];
  const missingPermissions = permissionsNeeded.filter((perm) => !chan.permissionsFor(client.user)?.has(perm));
  if (missingPermissions.length > 0) {
    logToFile(`Le bot n'a pas les permissions suivantes dans le chan ${ID_Chan}: ${missingPermissions.join(", ")}`);
    return false;
  }

  return true;
}
