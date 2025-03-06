// fichier annexe
import { EmbedBuilder } from "discord.js";
import { userInfo } from "./database.js";
import { loadTranslations } from "./language.js";

export async function EmbedData(interaction) {
  const CurrentPlayer = await userInfo(interaction.guildId, interaction.user.id);
  // console.log("CurrentPlayer : ", CurrentPlayer);

  if (CurrentPlayer != null) {
    const translate = await loadTranslations(CurrentPlayer.userLangage);

    let PP = 0;
    if (CurrentPlayer.NbGvGParticiped != 0) {
      PP = Math.round((CurrentPlayer.NbGvGParticiped / CurrentPlayer.NbTotalGvG) * 100);
    }

    let lvlhero = translate.EmbedData.nodata;
    if (CurrentPlayer.Lvl == 0) {
      lvlhero = translate.EmbedData.lvl; // "non defini \nutilise /level pour le definir";
    } else {
      lvlhero = CurrentPlayer.Lvl;
    }

    let classe = translate.EmbedData.classe; // "non defini\nutilise /classe pour le definir";
    if (CurrentPlayer.Classe != 0) {
      classe = CurrentPlayer.Classe;
    }

    let PPLPR = translate.EmbedData.nodata; // "Aucune donnée";
    let markp = "";
    if (CurrentPlayer.EtatInscription == 1) {
      PPLPR = translate.EmbedData.present; // "Inscrit présent";
      markp = ":white_check_mark:";
    } else if (CurrentPlayer.EtatInscription == 0) {
      PPLPR = translate.EmbedData.noinscrit; // "Non inscrit";
      markp = ":sob:";
    } else if (CurrentPlayer.EtatInscription == 3) {
      PPLPR = translate.EmbedData.absent; //"Inscrit absent";
      markp = ":x:";
    } else {
      PPLPR = translate.EmbedData.never; // "Jamais absent";
    }

    let last_GvG = translate.EmbedData.nolastGvG;
    if (CurrentPlayer.DateLastGvGParticiped != "") {
      last_GvG = CurrentPlayer.DateLastGvGParticiped;
    }

    const DataEmbed = {
      title: translate.EmbedData.player + " : **__" + CurrentPlayer.DiscordName + "__**",
      color: 13373715,
      thumbnail: {
        url: interaction.user.avatarURL(),
      },
      fields: [
        {
          name: translate.EmbedData.description_classe, //"Classe joué en GvG",
          value: classe,
          inline: true,
        },
        {
          name: translate.EmbedData.description_lvl, // "Niveau de héros",
          value: lvlhero,
        },
        {
          name: translate.EmbedData.description_influence, // "Influence de votre héros (700 + armure)",
          value: CurrentPlayer.Influence,
        },
        {
          name: markp + " " + translate.EmbedData.description_inscription_GvG, //" inscription GvG",
          value: PPLPR,
        },
        {
          name: translate.EmbedData.stat, //"Statistique GvG",
          value:
            translate.EmbedData.partiped_GvG +
            " : ***" +
            CurrentPlayer.NbGvGParticiped +
            "***\n" +
            translate.EmbedData.last_GvG +
            " : ***" +
            last_GvG +
            "***\n" +
            translate.EmbedData.pourcent_GvG +
            " : ***" +
            PP +
            "%***",
        },
      ],
    };

    return DataEmbed;
  } else {
    const errorEmbed = new EmbedBuilder().setTitle("❌ Error").setDescription("Error").setColor("Red").setTimestamp();
    return errorEmbed;
  }
}
