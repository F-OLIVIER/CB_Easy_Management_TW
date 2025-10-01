// fichier annexe
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { loadTranslations } from "./language.js";
import { updateIdMessage } from "./database.js";
import { client } from "./Constant.js";
import { adressdb, siteInternet } from "./config.js";
import { logToFile } from "./log.js";

// module nodejs et npm
import moment from "moment-timezone";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function initial_msgreactgvg(Langage, ID_Chan_GvG, ID_Group_Users, Late) {
  const chan = client.channels.cache.get(ID_Chan_GvG);
  if (!chan) {
    logToFile(`Chan ${ID_Chan_GvG} innexistant`, "errors_bot.log");
    return 0;
  }
  // Vérifie si le bot a la permission d'envoyer des messages et d'intégrer des liens
  if (!chan.permissionsFor(client.user)?.has(["SendMessages", "AttachFiles", "EmbedLinks"])) {
    logToFile(`Le bot n'a pas la permission d'envoyer des messages dans le chan ${ID_Chan_GvG} (initial_msgreactgvg)`, "errors_bot.log");
    return -1;
  }

  // Génére le message initial d'inscription au GvG et l'envoi sur discord
  const imageAttachment = new AttachmentBuilder(siteInternet + "/img/imgdiscord/banner_tw.webp");
  const sendMessage = await chan.send({
    files: [imageAttachment],
    content: "<@&" + ID_Group_Users + ">",
    embeds: [await EmbedInscription(Langage, [], [], [], Late)],
    components: [await ButtonEmbedInscription(Langage, Late)],
  });

  // Retourne l'id du message pour création de la maison dans la table Houses
  return sendMessage.id;
}

// Renouvellement du message d'inscription GvG pour reset les réactions
export async function msgreactgvg(db, ID_Server, ID_MessageGvG, Langage, ID_Chan_GvG, ID_Group_Users, Late = 0) {
  const chan = client.channels.cache.get(ID_Chan_GvG);
  if (!chan) {
    logToFile(`Chan ${ID_Chan_GvG} innexistant pour le serveur ${ID_Server}`, "errors_bot.log");
    return;
  }
  if (!chan.permissionsFor(client.user)?.has(["SendMessages", "AttachFiles", "EmbedLinks"])) {
    logToFile(`Le bot n'a pas la permission d'envoyer des messages dans ${ID_Chan_GvG} pour le serveur ${ID_Server} (msgreactgvg)`, "errors_bot.log");
    return;
  }

  await chan.messages
    .fetch(ID_MessageGvG)
    .then((message) => message.delete())
    .catch((error) => logToFile(`Message ${ID_MessageGvG} innexistant pour le serveur ${ID_Server} (msgreactgvg) :\n${error}`));

  const imageAttachment = new AttachmentBuilder(siteInternet + "/img/imgdiscord/banner_tw.webp");
  // Génére le message et l'envoi sur discord
  const sendMessage = await chan.send({
    files: [imageAttachment],
    content: "<@&" + ID_Group_Users + ">",
    embeds: [await EmbedInscription(Langage, [], [], [], Late)],
    components: [await ButtonEmbedInscription(Langage, Late)],
  });

  // Inscription du nouvelle ID du message dans la db
  updateIdMessage(db, ID_Server, sendMessage.id);
}

export async function EmbedInscription(Langage, presents = [], late = [], absents = [], Late) {
  const nbpresent = presents.length;
  const nblate = late.length;
  const nbabsents = absents.length;

  const translate = await loadTranslations(Langage);

  if (Late === 1) {
    const embedData = new EmbedBuilder()
      .setTitle(translate.EmbedGvG.title)
      .setColor(13373715)
      .setDescription(translate.EmbedGvG.description)
      .setThumbnail(siteInternet + "/img/imgdiscord/heros_att.webp")
      .addFields(
        { name: translate.EmbedGvG.date, value: dateGvG(Langage) + "\n\n", inline: false },
        {
          name: "✅ " + nbpresent + " __" + translate.EmbedGvG.nbpresent + "__",
          value: presents.length ? presents.join("\n") : translate.EmbedGvG.noinscrit,
          inline: true,
        },
        {
          name: "🕐 " + nblate + " __" + translate.EmbedGvG.nblate + "__",
          value: late.length ? late.join("\n") : translate.EmbedGvG.noinscrit,
          inline: true,
        },
        {
          name: "❌ " + nbabsents + " __" + translate.EmbedGvG.nbabsent + "__",
          value: absents.length ? absents.join("\n") : translate.EmbedGvG.noinscrit,
          inline: true,
        }
      );

    return embedData;
  } else {
    const embedData = new EmbedBuilder()
      .setTitle(translate.EmbedGvG.title)
      .setColor(13373715)
      .setDescription(translate.EmbedGvG.description)
      .setThumbnail(siteInternet + "/img/imgdiscord/heros_att.webp")
      .addFields(
        { name: translate.EmbedGvG.date, value: dateGvG(Langage) + "\n\n", inline: false },
        {
          name: "✅ " + nbpresent + " __" + translate.EmbedGvG.nbpresent + "__",
          value: presents.length ? presents.join("\n") : translate.EmbedGvG.noinscrit,
          inline: true,
        },
        {
          name: "❌ " + nbabsents + " __" + translate.EmbedGvG.nbabsent + "__",
          value: absents.length ? absents.join("\n") : translate.EmbedGvG.noinscrit,
          inline: true,
        }
      );

    return embedData;
  }
}

export async function ButtonEmbedInscription(Langage, Late = 0) {
  const translate = await loadTranslations(Langage);

  if (Late == 1) {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("present")
        .setLabel("✅ " + translate.EmbedGvG.button_present)
        .setStyle(ButtonStyle.Success),
      // ajout du bouton "en retard"
      new ButtonBuilder()
        .setCustomId("late")
        .setLabel("🕐 " + translate.EmbedGvG.button_late)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("absent")
        .setLabel("✖️ " + translate.EmbedGvG.button_absent)
        .setStyle(ButtonStyle.Danger)
    );
    return buttons;
  } else {
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("present")
        .setLabel("✅ " + translate.EmbedGvG.button_present)
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("absent")
        .setLabel("✖️ " + translate.EmbedGvG.button_absent)
        .setStyle(ButtonStyle.Danger)
    );
    return buttons;
  }
}

export async function ButtonNotActifEmbedInscription(Langage) {
  const translate = await loadTranslations(Langage);

  const buttons = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close").setLabel(translate.EmbedGvG.button_close).setStyle(ButtonStyle.Secondary).setDisabled(true));

  return buttons;
}

export async function noGvGReactMsgGvG(houseData) {
  const chan = client.channels.cache.get(houseData.ID_Chan_GvG);
  if (!chan) {
    logToFile(`Chan ${houseData.ID_Chan_GvG} innexistant pour le serveur ${houseData.ID_Server}`, "errors_bot.log");
    return;
  }
  if (!chan.permissionsFor(client.user)?.has(["SendMessages", "AttachFiles", "EmbedLinks"])) {
    logToFile(`Le bot n'a pas la permission d'envoyer des messages dans ${houseData.ID_Chan_GvG} pour le serveur ${houseData.ID_Server} (noGvGReactMsgGvG)`, "errors_bot.log");
    return;
  }

  const message = await chan.messages.fetch(houseData.ID_MessageGvG);
  if (message) {
    await message.delete();
  }

  const translate = await loadTranslations(houseData.Langage);

  const imageAttachment = new AttachmentBuilder(siteInternet + "/img/imgdiscord/banner_notw.webp");
  const embedData = new EmbedBuilder()
    .setTitle(translate.EmbedGvG.title)
    .setColor(13373715)
    .setDescription(translate.EmbedGvG.description_nogvg)
    .setThumbnail(siteInternet + "/img/imgdiscord/heros_repos.webp");

  // Génére le message et l'envoi sur discord
  const sendMessage = await chan.send({
    files: [imageAttachment],
    embeds: [embedData],
  });

  // Inscription du nouvelle ID du message dans la db
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
  });

  try {
    await updateIdMessage(db, houseData.ID_Server, sendMessage.id);
  } catch (err) {
    logToFile(`Erreur updateIdMessage (noGvGReactMsgGvG) :\n${err.message}`, "errors_bot.log");
    throw err;
  } finally {
    await db.close();
  }
}

function dateGvG(Langage) {
  // gestion de la date futur pour le message
  const now = moment().tz("Europe/Paris");

  // si mardi, annonce du samedi et si Samedi, annonce du mardi
  let futurdate;
  switch (
    now.day() // 2 mardi, 6 samedi
  ) {
    case 0: // dimanche
      futurdate = now.add(2, "days");
      break;

    case 1: // lundi
      futurdate = now.add(1, "days");
      break;

    case 2: // mardi
      // test si avant 21h
      if (now.hour() < 21) {
        futurdate = now.add(0, "days");
      } else {
        futurdate = now.add(4, "days");
      }
      break;

    case 3: // mercredi
      futurdate = now.add(3, "days");
      break;

    case 4: // jeudi
      futurdate = now.add(2, "days");
      break;

    case 5: // vendredi
      futurdate = now.add(1, "days");
      break;

    case 6: // samedi
      // test si avant 22h
      if (now.hour() < 21) {
        futurdate = now.add(0, "days");
      } else {
        futurdate = now.add(3, "days");
      }
      break;
  }

  // génére la date au bon format
  const futurdateformate = new Date(futurdate + moment().tz("Europe/Paris").utcOffset());

  var moisfr = "";
  var moisen = "";
  switch (futurdateformate.getMonth()) {
    case 0:
      moisfr = "janvier";
      moisen = "January";
      break;
    case 1:
      moisfr = "février";
      moisen = "February";
      break;
    case 2:
      moisfr = "mars";
      moisen = "March";
      break;
    case 3:
      moisfr = "avril";
      moisen = "April";
      break;
    case 4:
      moisfr = "mai";
      moisen = "May";
      break;
    case 5:
      moisfr = "juin";
      moisen = "June";
      break;
    case 6:
      moisfr = "juillet";
      moisen = "July";
      break;
    case 7:
      moisfr = "août";
      moisen = "August";
      break;
    case 8:
      moisfr = "septembre";
      moisen = "September";
      break;
    case 9:
      moisfr = "octobre";
      moisen = "October";
      break;
    case 10:
      moisfr = "novembre";
      moisen = "November";
      break;
    case 11:
      moisfr = "décembre";
      moisen = "December";
      break;
  }

  var dateFR = "";
  var dateEN = "";
  const jour = futurdateformate.getDay();
  if (jour == 2) {
    // la date sera un mardi (jour 2)
    dateFR = "Mardi " + futurdateformate.getDate() + " " + moisfr + "";
    dateEN = "Tuesday" + futurdateformate.getDate() + " " + moisen + "";
  } else if (jour == 6) {
    // la date sera un samedi (jour 6)
    dateFR = "Samedi " + futurdateformate.getDate() + " " + moisfr + "";
    dateEN = "Saturday" + futurdateformate.getDate() + " " + moisen + "";
  }

  if (Langage == "fr") {
    return dateFR;
  } else {
    return dateEN;
  }
}
