// fichier annexe
import { EmbedBuilder } from "discord.js";
import { userInfo } from "./database.js";
import { translate } from "./translate.js";

export async function EmbedData(interaction) {
  const CurrentPlayer = await userInfo(interaction.guildId, interaction.user.id);
  // console.log("CurrentPlayer : ", CurrentPlayer);

  if (CurrentPlayer != null) {
    let PP = 0;
    if (CurrentPlayer.NbGvGParticiped != 0) {
      PP = Math.round((CurrentPlayer.NbGvGParticiped / CurrentPlayer.NbTotalGvG) * 100);
    }

    let lvlhero = translate[CurrentPlayer.userLangage].EmbedData.nodata;
    if (CurrentPlayer.Lvl == 0) {
      lvlhero = translate[CurrentPlayer.userLangage].EmbedData.lvl; // "non defini \nutilise /level pour le definir";
    } else {
      lvlhero = CurrentPlayer.Lvl;
    }

    let classe = translate[CurrentPlayer.userLangage].EmbedData.classe; // "non defini\nutilise /classe pour le definir";
    if (CurrentPlayer.Classe != 0) {
      classe = CurrentPlayer.Classe;
    }

    let PPLPR = translate[CurrentPlayer.userLangage].EmbedData.nodata; // "Aucune donnée";
    let markp = "";
    if (CurrentPlayer.EtatInscription == 1) {
      PPLPR = translate[CurrentPlayer.userLangage].EmbedData.present; // "Inscrit présent";
      markp = ":white_check_mark:";
    } else if (CurrentPlayer.EtatInscription == 0) {
      PPLPR = translate[CurrentPlayer.userLangage].EmbedData.noinscrit; // "Non inscrit";
      markp = ":sob:";
    } else if (CurrentPlayer.EtatInscription == 3) {
      PPLPR = translate[CurrentPlayer.userLangage].EmbedData.absent; //"Inscrit absent";
      markp = ":x:";
    } else {
      PPLPR = translate[CurrentPlayer.userLangage].EmbedData.never; // "Jamais absent";
    }

    let last_GvG = translate[CurrentPlayer.userLangage].EmbedData.nolastGvG;
    if (CurrentPlayer.DateLastGvGParticiped != "") {
      last_GvG = CurrentPlayer.DateLastGvGParticiped;
    }

    const DataEmbed = {
      title: translate[CurrentPlayer.userLangage].EmbedData.player + " : **__" + CurrentPlayer.DiscordName + "__**",
      color: 13373715,
      thumbnail: {
        url: interaction.user.avatarURL(),
      },
      fields: [
        {
          name: translate[CurrentPlayer.userLangage].EmbedData.description_classe, //"Classe joué en GvG",
          value: classe,
          inline: true,
        },
        {
          name: translate[CurrentPlayer.userLangage].EmbedData.description_lvl, // "Niveau de héros",
          value: lvlhero,
        },
        {
          name: translate[CurrentPlayer.userLangage].EmbedData.description_influence, // "Influence de votre héros (700 + armure)",
          value: CurrentPlayer.Influence,
        },
        {
          name: markp + " " + translate[CurrentPlayer.userLangage].EmbedData.description_inscription_GvG, //" inscription GvG",
          value: PPLPR,
        },
        {
          name: translate[CurrentPlayer.userLangage].EmbedData.stat, //"Statistique GvG",
          value:
            translate[CurrentPlayer.userLangage].EmbedData.partiped_GvG +
            " : ***" +
            CurrentPlayer.NbGvGParticiped +
            "***\n" +
            translate[CurrentPlayer.userLangage].EmbedData.last_GvG +
            " : ***" +
            last_GvG +
            "***\n" +
            translate[CurrentPlayer.userLangage].EmbedData.pourcent_GvG +
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
