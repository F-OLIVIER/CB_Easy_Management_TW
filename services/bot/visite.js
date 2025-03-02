// fichier annexe
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { cmdclass, updateInflu, updateLvl, updateclass } from "./database.js";
import { translate } from "./translate.js";
import { interactionsCache } from "./Main.js";

export async function visite_language(interaction) {
  const options = Object.values(translate.list_language).map((language) => ({
    label: language.name,
    value: language.id,
  }));

  const selectMenu = new StringSelectMenuBuilder().setCustomId("visit_language").setPlaceholder("Select your language").addOptions(options);
  const row = new ActionRowBuilder().addComponents(selectMenu);

  await interaction.reply({
    content: "<@" + interaction.user.id + ">, select your language",
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
}

export async function slashvisite(interaction) {
  const language = interaction.values[0];
  // Initialisation du cache pour l'utilisateur
  interactionsCache.set(interaction.user.id, {
    Langage: language,
  });

  const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("visite_start").setLabel("start visite").setStyle(ButtonStyle.Success));

  const response = await interaction.reply({
    content: translate[language].visite[1] + ` <@${interaction.user.id}>\n` + translate[language].visite[2],
    components: [button],
    flags: MessageFlags.Ephemeral,
  });

  const collectorFilter = (i) => i.user.id === interaction.user.id;
  try {
    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
    if (confirmation.customId === "visite_start") {
      interaction.editReply({
        content: "<@" + interaction.user.id + ">\n" + translate[language].visite[1] + ` **${interaction.user.username}**\n` + translate[language].visite[2],
        components: [],
      });
      return true;
    }
  } catch (e) {
    await interaction.editReply({
      content: "<@" + interaction.user.id + ">\n" + translate[language].visite[1] + ` **${interaction.user.username}**\n` + translate[language].visite[2],
      components: [],
    });
  }

  return true;
}

export async function visit1(interaction) {
  let data_cache = interactionsCache.get(interaction.user.id);
  const button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("visite_modal").setLabel(translate[data_cache.Langage].visite[3]).setStyle(ButtonStyle.Primary));

  const response = await interaction.reply({
    content: "<@" + interaction.user.id + ">\n" + translate[data_cache.Langage].visite[4],
    components: [button],
    flags: MessageFlags.Ephemeral,
  });

  const collectorFilter = (i) => i.user.id === interaction.user.id;
  try {
    await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
  } catch (e) {
    await interaction.editReply({
      content: "<@" + interaction.user.id + ">\n" + translate[data_cache.Langage].visite[4],
      components: [],
    });
  }
  return true;
}

export async function modalvisitelvlAndInflu(interaction) {
  let data_cache = interactionsCache.get(interaction.user.id);
  const modal = new ModalBuilder()
    .setTitle("Visite")
    .setCustomId("modalvisite")
    .setComponents(
      new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("visite_lvl").setLabel(translate[data_cache.Langage].visite[5]).setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().setComponents(new TextInputBuilder().setCustomId("visite_influ").setLabel(translate[data_cache.Langage].visite[6]).setStyle(TextInputStyle.Short).setRequired(true))
    );

  await interaction.showModal(modal);
}

export async function visit2(interaction) {
  let data_cache = interactionsCache.get(interaction.user.id);
  let textVisite = translate[data_cache.Langage].visite[7];
  // mise à jour du level
  const visite_lvl = parseInt(interaction.fields.getTextInputValue("visite_lvl"));
  let valid = true;
  if (!isNaN(visite_lvl)) {
    updateLvl(interaction.guildId, interaction.user.id, visite_lvl);
  } else {
    valid = false;
  }
  // mise à jour de l'influence
  const visite_influ = parseInt(interaction.fields.getTextInputValue("visite_influ"));
  if (!isNaN(visite_influ)) {
    updateInflu(interaction.guildId, interaction.user.id, visite_influ);
  } else {
    valid = false;
  }

  if (!valid) {
    textVisite = translate[data_cache.Langage].visite[8];
  }

  // Suite de la visite
  const options = await cmdclass(data_cache.Langage);
  const select = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("visite_class").addOptions(options));
  const response = await interaction.reply({
    content: "<@" + interaction.user.id + ">\n" + textVisite,
    components: [select],
    flags: MessageFlags.Ephemeral,
  });

  const collectorFilter = (i) => i.user.id === interaction.user.id;
  try {
    await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });
  } catch (e) {
    await interaction.editReply({
      content: "<@" + interaction.user.id + ">\n" + textVisite,
      components: [],
    });
  }
  return true;
}

export async function visit3(interaction) {
  let data_cache = interactionsCache.get(interaction.user.id);

  // mise à jour de la classe
  updateclass(interaction.guildId, interaction.user.id, interaction.values[0]);

  // Suite de la visite
  await interaction.reply({
    content: "<@" + interaction.user.id + ">\n" + translate[data_cache.Langage].visite[9],
    components: [],
    flags: MessageFlags.Ephemeral,
  });

  interactionsCache.delete(interaction.user.id);

  return true;
}
