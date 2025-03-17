// Fichier annexe
import { isMember, isOfficier, listInscription } from "./database.js";
import {
  config_1_language,
  config_2_avertissement,
  config_3_ID_Chan_GvG,
  config_4_ID_Chan_Gestion,
  config_5_ID_Chan_Users,
  config_6_ID_Group_Users,
  config_7_ID_Group_Officier,
  config_8_name_house,
  config_finish,
  config_finish_no,
  config_finish_yes,
  get_houseData,
  houseExist,
} from "./config_house.js";
import { botActivation, slashClass, slashHelp, slashInflu, slashLevel, slashResetmsggvg } from "./slashcommand.js";
import { siteInternet, store_app_android, store_app_ios } from "./config.js";
import { PlayerCreateOrUpdate } from "./FuncData.js";
import { MAJinscription } from "./FuncRaid.js";
import { genereTokenApp } from "./appMobile.js";
import { EmbedInscription } from "./Embed_gvg.js";
import { EmbedData } from "./Embed_data.js";
import { EmbedGuide } from "./Embed_guide.js";
import { reponseUserInteraction } from "./Constant.js";
import { loadTranslations } from "./language.js";

// Module nodejs et npm
import { MessageFlags } from "discord.js";
import {} from "dotenv/config";

export async function slash_interaction(interaction) {
  if (interaction.user.bot) return;

  // ----------------------------------------------------------------------------
  // --------------------------- Embed Inscription ------------------------------
  // ----------------------------------------------------------------------------
  const userId = interaction.user.id;

  if (interaction.isButton() && isMember(interaction.guildId, userId)) {
    if (interaction.customId === "config_avertissement") {
      await config_3_ID_Chan_GvG(interaction);
    }

    // Gestion des boutons d'inscription au GvG
    if (interaction.customId === "present" || interaction.customId === "absent") {
      if (interaction.customId === "present") {
        await MAJinscription(userId, 1);
      } else if (interaction.customId === "absent") {
        await MAJinscription(userId, 3);
      }

      const houseData = await get_houseData(interaction.guildId);
      const listinscrit = await listInscription(houseData.ID);

      let presentList = [];
      if (listinscrit[0] !== undefined) {
        presentList = await Promise.all(
          listinscrit[0]
            .filter((id) => BigInt(id) !== BigInt(0)) // Filtrer les id égaux à 0 (user de test)
            .map(async (id) => {
              const userId = BigInt(id);
              return "<@" + userId.toString() + ">";
            })
        );
      }

      let absentList = [];
      if (listinscrit[1] !== undefined) {
        absentList = await Promise.all(
          listinscrit[1]
            .filter((id) => BigInt(id) !== BigInt(0)) // Filtrer les id égaux à 0 (user de test)
            .map(async (id) => {
              const userId = BigInt(id);
              return "<@" + userId.toString() + ">";
            })
        );
      }

      await interaction
        .update({
          embeds: [await EmbedInscription(houseData.Langage, presentList, absentList)],
        })
        .catch((err) => {
          logToFile(`Error update Embed EmbedInscription \nhouseData : ${houseData}\n${err}`, "errors_bot.log");
        });

      return;
    }
  }

  // ------------------------
  // ----- Modal Submit -----
  // ------------------------
  if (interaction.isModalSubmit()) {
    if (interaction.customId === "modalHouse_name") {
      await config_finish(interaction);
      return true;
    }
  }

  // L'interaction est de type composant d'un message
  if (interaction.isMessageComponent()) {
    // ------------ Config_house ------------
    if (interaction.customId === "config_language") {
      await config_2_avertissement(interaction);
      return true;
    }
    if (interaction.customId === "config_3_ID_Chan_GvG") {
      await config_4_ID_Chan_Gestion(interaction);
      return true;
    }
    if (interaction.customId === "config_4_ID_Chan_Gestion") {
      await config_5_ID_Chan_Users(interaction);
      return true;
    }
    if (interaction.customId === "config_5_ID_Chan_Users") {
      await config_6_ID_Group_Users(interaction);
      return true;
    }
    if (interaction.customId === "config_6_ID_Group_Users") {
      await config_7_ID_Group_Officier(interaction);
      return true;
    }
    if (interaction.customId === "config_7_ID_Group_Officier") {
      await config_8_name_house(interaction);
      return true;
    }
    if (interaction.customId === "config_finish_yes") {
      await config_finish_yes(interaction);
      return true;
    }
    if (interaction.customId === "config_finish_no") {
      await config_finish_no(interaction);
      return true;
    }
  }

  // -----------------------------
  // ---- Command utilisateur ----
  // -----------------------------
  if (!interaction.isCommand()) return;
  // Mise à jour de l'utilisateur avant de lui répondre
  if (await houseExist(interaction.guildId)) {
    await PlayerCreateOrUpdate(interaction.guildId, interaction.user.id);
  }

  if (interaction.commandName === "config") {
    if (await houseExist(interaction.guildId)) {
      const houseData = await get_houseData(interaction.guildId);

      if ((await isOfficier(interaction.guildId, interaction.user.id)) || interaction.user.id == interaction.guild.ownerId) {
        // Une fois la maison crée, seul les membres du groupe gestionnaire peuvent modifier la configuration
        config_1_language(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, `${translate.global_config.config_exist[1]} <@${houseData.ID_Group_Officier}> ${translate.global_config.config_exist[2]}`);
      }
    } else {
      // Tous les utilisateurs peuvent effectué la configuration
      config_1_language(interaction);
    }
  }

  // interaction changement de level du héros, Command /visite
  if (interaction.commandName === "help") {
    return await slashHelp(interaction);
  }

  // interaction qui retourne l'embed data de l'utilisateur, Command /data
  if (interaction.commandName === "data") {
    if (await houseExist(interaction.guildId)) {
      if (isMember(interaction.guildId, userId)) {
        interaction.reply({
          embeds: [await EmbedData(interaction)],
          flags: MessageFlags.Ephemeral,
        });
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noingroup);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
    }
    return true;
  }

  // interaction qui retourne l'embed guide de l'utilisateur, Command /guide
  if (interaction.commandName === "tuto") {
    if (await houseExist(interaction.guildId)) {
      interaction.reply({
        embeds: [await EmbedGuide()],
        flags: MessageFlags.Ephemeral,
      });
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
    }
    return true;
  }

  // interaction changement de level du héros, Command /level
  if (interaction.commandName === "level") {
    if (await houseExist(interaction.guildId)) {
      if (isMember(interaction.guildId, userId)) {
        return await slashLevel(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noingroup);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
      return true;
    }
  }

  // interaction changement de l'influence du héros, Command /influence
  if (interaction.commandName === "influence") {
    if (await houseExist(interaction.guildId)) {
      if (isMember(interaction.guildId, userId)) {
        return await slashInflu(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noingroup);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
      return true;
    }
  }

  // interaction changement de classe, Command /classe
  if (interaction.commandName === "classe") {
    if (await houseExist(interaction.guildId)) {
      if (isMember(interaction.guildId, userId)) {
        return await slashClass(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noingroup);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
      return true;
    }
  }

  // interaction qui donne l'adresse du site internet associé au bot, Command /site
  if (interaction.commandName === "website") {
    const translate = await loadTranslations("global");
    await reponseUserInteraction(interaction, `${translate.website}\n${siteInternet}`);
    return true;
  }

  // interaction qui génére un toekn pour l'application mobile et donne les liens des application (Google play store et Apple store), Commant /app_mobile
  if (interaction.commandName === "smartphone") {
    if (await houseExist(interaction.guildId)) {
      if (isMember(interaction.guildId, userId)) {
        const tokenapp = await genereTokenApp(interaction.guildId, interaction.user.id);
        const houseData = await get_houseData(interaction.guildId);
        const translate = await loadTranslations(houseData.Langage);

        if (tokenapp == "") {
          await reponseUserInteraction(interaction, translate.information.smartphone.err);
        } else {
          await interaction.reply({
            content:
              `<@${interaction.user.id}>\n\n` +
              `${translate.information.smartphone.ok.description.join("\n")}\n\n` +
              `${translate.information.smartphone.ok.link_android} :\n<${store_app_android}>\n\n` +
              `${translate.information.smartphone.ok.link_ios} :\n<${store_app_ios}>`,
            flags: MessageFlags.Ephemeral,
          });
          await interaction.followUp({
            content: tokenapp,
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noingroup);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
    }
    return true;
  }

  // ------------------------------
  // ---- Command Gestionnaire ----
  // ------------------------------

  if (interaction.commandName === "reset_msg_tw") {
    if (await houseExist(interaction.guildId)) {
      if (isOfficier(interaction.guildId, userId)) {
        return await slashResetmsggvg(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noPermission);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
      return true;
    }
  }

  if (interaction.commandName === "bot_activation") {
    if (await houseExist(interaction.guildId)) {
      if (isOfficier(interaction.guildId, userId)) {
        return await botActivation(interaction);
      } else {
        const translate = await loadTranslations("global");
        await reponseUserInteraction(interaction, translate.global_config.noPermission);
      }
    } else {
      const translate = await loadTranslations("global");
      await reponseUserInteraction(interaction, `${translate.global_config.botNotExist}\n${siteInternet}`);
      return true;
    }
  }
}
