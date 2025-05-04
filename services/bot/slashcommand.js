// fichier annexe
import { ActionRowBuilder, MessageFlags, REST, Routes, StringSelectMenuBuilder } from "discord.js";
import { cmdclass, resetManuelMsgGvG, updateBotActivation, updateInflu, updateLvl, updateclass, userInfo } from "./database.js";
import { client, msgChanDiscord, reponseUserInteraction } from "./Constant.js";
import { get_houseData } from "./config_house.js";
import { noGvGReactMsgGvG } from "./Embed_gvg.js";
import { loadTranslations } from "./language.js";
import { logToFile } from "./log.js";

// Module nodejs et npm
import {} from "dotenv/config";

export async function createCommands() {
  try {
    console.log("│ • Started creating application (/) commands     │");
    // Type 1 correspond à une Subcommand
    // Type 2 correspond à un Subcommand Group
    // Type 3 correspond à un String
    // Type 4 correspond à un entier
    // Type 5 correspond à un Boolean
    // Type 6 correspond à un User (Un utilisateur Discord)
    // Type 7 correspond à un Channel (Un canal Discord)
    // Type 8 correspond à un Role (Un rôle Discord)

    // -------------------------------------------------------------------
    // ---------------------- Command utilisateur ------------------------
    // -------------------------------------------------------------------

    // Suppression les slash command de l'intégration discord
    // const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    // await rest.put(Routes.applicationCommands(process.env.ID_APP), { body: [] });

    await client.application.commands.set([
      // Création de la commande '/help'
      {
        name: "help",
        description: "List of commands proposed by the bot",
      },

      // Création de la commande '/data'
      {
        name: "data",
        description: "Displays user information",
      },

      // Création de la commande '/tuto'
      // {
      //   name: "tuto",
      //   description: "Displays help information (tutorials, etc.) about Conqueror's Blade",
      // },

      // Création de la commande '/website'
      {
        name: "website",
        description: "Link to the bot's associated website",
      },

      // Création de la commande '/smarthone'
      {
        name: "smartphone",
        description: "Generates a connection token for the mobile application",
      },

      // Création de la commande '/class'
      {
        name: "class",
        description: "Update the weapon played with your hero",
      },

      // Création de la commande '/lvl'
      {
        name: "level",
        description: "Update your hero's level",
        options: [
          {
            name: "lvl_number",
            description: "hero's level",
            type: 4, // entier
            min_value: 0,
            max_value: 100000,
            required: true,
          },
        ],
      },

      // Création de la commande '/influ'
      {
        name: "influence",
        description: "Update your hero's influence",
        options: [
          {
            name: "influ_number",
            description: "hero's influence",
            type: 4, // entier
            min_value: 700,
            max_value: 1000,
            required: true,
          },
        ],
      },

      // -------------------------------------------------------------------
      // ------------------- Command gestionnaire du bot -------------------
      // -------------------------------------------------------------------
      // Création de la commande '/config'
      {
        name: "config",
        description: "Configuring the bot discord",
      },

      // Création de la commande '/resetmsggvg'
      {
        name: "reset_msg_tw",
        description: "Manual reset of the GvG registration message (for managers only)",
      },

      // Création de la commande '/activation_msg_tw'
      {
        name: "activation_msg_tw",
        description: "Enable or disable GvG registration message (for managers only)",
        options: [
          {
            name: "option_msg_tw",
            description: "Choose an option",
            type: 3, // 3 correspond à une option de type chaîne de texte
            required: true,
            choices: [
              {
                name: "on",
                value: "on",
              },
              {
                name: "off",
                value: "off",
              },
            ],
          },
        ],
      },
    ]);

    console.log("│ • Successfully created application (/) commands │");
  } catch (err) {
    logToFile(`Error created application (/) commands :\n ${err}`, "errors_bot.log");
    console.error("Error created application (/) commands :\n", err);
  }
}

// -------------------------------------------------------------------
// --------------------- Function utilisateur ------------------------
// -------------------------------------------------------------------

export async function slashHelp(interaction) {
  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);
  await reponseUserInteraction(interaction, translate.help.join("\n"));
  return true;
}

export async function slashLevel(interaction) {
  const lvlnumber = interaction.options.getInteger("lvl_number");
  await updateLvl(interaction.guildId, interaction.user.id, lvlnumber);

  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);
  await reponseUserInteraction(interaction, `${translate.information.lvl} : ${lvlnumber}`);
  return true;
}

export async function slashInflu(interaction) {
  const influnumber = interaction.options.getInteger("influ_number");
  await updateInflu(interaction.guildId, interaction.user.id, influnumber);

  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);
  await reponseUserInteraction(interaction, `${translate.information.influ} ${influnumber}`);
  return true;
}

export async function slashClass(interaction) {
  const user_Info = await userInfo(interaction.guildId, interaction.user.id);
  const options = await cmdclass(user_Info.userLangage);

  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);
  const select = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("class_selector").addOptions(options));
  const responseClass = await interaction.reply({
    content: translate.information.class.select,
    components: [select],
    flags: MessageFlags.Ephemeral,
  });

  // attente de la réponse de l'utilisateur
  const collectorFilter = (i) => i.user.id === interaction.user.id;
  try {
    const confirmation_responseClass = await responseClass.awaitMessageComponent({
      filter: collectorFilter,
      time: 60_000,
    });
    // intéraction une fois la réponse récupéré
    if (confirmation_responseClass.customId === "class_selector") {
      if (updateclass(interaction.guildId, interaction.user.id, confirmation_responseClass.values[0])) {
        interaction.editReply({
          content: translate.information.class.confirm,
          components: [],
        });
        return true;
      } else {
        interaction.editReply({
          content: translate.information.class.err,
          components: [],
        });
      }
    }
  } catch (e) {
    await interaction.editReply({
      content: translate.information.class.delay,
      components: [],
    });
  }
  return false;
}

// -------------------------------------------------------------------
// ------------------ Function gestionnaire du bot -------------------
// -------------------------------------------------------------------
export async function slashResetmsggvg(interaction) {
  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);

  if (houseData.Allumage == "0") {
    resetManuelMsgGvG(houseData);
    msgChanDiscord(houseData.ID_Group_Officier, houseData.ID_Chan_Gestion, "<@" + interaction.user.id + "> " + translate.gestion.resetmanuelmsggvg);
    await reponseUserInteraction(interaction, translate.gestion.resetmsggvg.ok);
  } else {
    await reponseUserInteraction(interaction, translate.gestion.resetmsggvg.notok);
  }
  return true;
}

export async function botActivation(interaction) {
  const option = interaction.options.getString("option_msg_tw");
  const houseData = await get_houseData(interaction.guildId);
  const translate = await loadTranslations(houseData.Langage);

  // Activation des inscriptions GvG
  if (option === "on") {
    if (houseData.Allumage == "1") {
      await updateBotActivation(interaction.guildId, "0");
      await resetManuelMsgGvG(houseData);
      msgChanDiscord(houseData.ID_Group_Officier, houseData.ID_Chan_Gestion, "<@" + interaction.user.id + "> " + translate.gestion.updateBotActivation);
      await reponseUserInteraction(interaction, translate.gestion.botActivation.ok);
    } else {
      await reponseUserInteraction(interaction, translate.gestion.botActivation.notok);
    }
  }

  // Désactivation des inscriptions GvG
  if (option === "off") {
    if (houseData.Allumage == "0") {
      await updateBotActivation(interaction.guildId, "1");
      await noGvGReactMsgGvG(houseData);
      await msgChanDiscord(houseData.ID_Group_Officier, houseData.ID_Chan_Gestion, "<@" + interaction.user.id + "> " + translate.gestion.updateBotActivation);
      await reponseUserInteraction(interaction, translate.gestion.botActivation.ok);
    } else {
      await reponseUserInteraction(interaction, translate.gestion.botActivation.notok);
    }
  }

  return true;
}
