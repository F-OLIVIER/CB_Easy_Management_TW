// fichier annexe
import { msgChanDiscord, sendPrivateMsg } from "./Constant.js";
import { loadTranslations } from "./language.js";
import { adressdb, discordTest_chanDM, discordTest_chanForum, discordTest_groupAdminForum } from "./config.js";
import { logToFile } from "./log.js";

// module nodejs et npm
import WebSocket from "ws";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const wss = new WebSocket.Server({ port: 8081 });

export function socket() {
  wss.on("connection", (ws) => {
    // console.log("✅ Client WebSocket connecté !");
    logToFile("✅ Client WebSocket connecté !");

    ws.on("message", function incoming(message) {
      try {
        const jsonMessage = JSON.parse(message);
        // console.log("jsonMessage : ", jsonMessage);
        logToFile(`Socket Message reçu : ${jsonMessage}`);

        switch (jsonMessage.type) {
          case "newunit":
            new_unit(jsonMessage.content);
            break;

          case "newclass":
            new_class(jsonMessage.content);
            break;

          case "informationdiscord":
            new_information(jsonMessage.content);
            break;

          case "new_post":
            msgChanDiscord(discordTest_groupAdminForum, discordTest_chanForum, jsonMessage.content.msg);
            break;

          case "validate_post":
            sendPrivateMsg(jsonMessage.content.userid, jsonMessage.content.msg);
            break;

          case "report":
            msgChanDiscord(discordTest_groupAdminForum, discordTest_chanForum, jsonMessage.content.msg);
            break;

          case "dm_discord":
            sendPrivateMsg(jsonMessage.content.userid, jsonMessage.content.msg);
            break;

          default:
            console.log("Message reçu (non traité):", jsonMessage);
            logToFile(`Socket Message reçu (non traité): ${jsonMessage}`, "err_socket.log");
            break;
        }
      } catch (err) {
        console.error("Error parsing message as JSON:", err);
        logToFile(`Socket Message,Error parsing message as JSON: ${err}`, "err_socket.log");
      }
    });

    ws.on("close", function close() {
      // console.log("❌ Client socket déconnecté !");
      logToFile("❌ Client socket déconnecté !");
    });
  });
}

// ------------------------------------------------------------
// -------------- Fonction de traitement socket ---------------
// ------------------------------------------------------------
async function new_unit(content) {
  const list_houses = await get_list_houses();
  for (let index = 0; index < list_houses.length; index++) {
    const house = list_houses[index];
    const translate = await loadTranslations(house.Langage);
    msgChanDiscord(house.ID_Group_Users, house.ID_Chan_Users, `${translate.socket.newunit[1]} \`${content[house.Langage]}\` ${translate.socket.newunit[2]}`);
  }
}

async function new_class(content) {
  const list_houses = await get_list_houses();
  for (let index = 0; index < list_houses.length; index++) {
    const house = list_houses[index];
    const translate = await loadTranslations(house.Langage);
    msgChanDiscord(house.ID_Group_Users, house.ID_Chan_Users, `${translate.socket.newclass[1]} \`${content[house.Langage]}\` ${translate.socket.newclass[2]}`);
  }
}

async function new_information(content) {
  const list_houses = await get_list_houses();

  // Envoi des messages en parallèle pour améliorer la rapidité
  await Promise.all(
    list_houses.map(async (house) => {
      if (!content[house.Langage]) return; // Vérifie si la clé existe

      // Remplacer les retours à la ligne par \n
      const message = content[house.Langage].replace(/\\n/g, "\n");

      // Envoi du message à Discord
      await msgChanDiscord(house.ID_Group_Users, house.ID_Chan_Users, message);
    })
  );
}

// ------------------------------------------------------------
// --------------- Fonction qui interroge la db ---------------
// ------------------------------------------------------------
export async function get_list_houses() {
  const db = await open({
    filename: adressdb,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY, // Mode lecture seule
  });

  try {
    const selectQuery = `SELECT Langage, ID_Server, ID_Chan_Users, ID_Group_Users FROM Houses;`;
    const houseData = await db.all(selectQuery);
    await db.close();
    return houseData || []; // Retourne un tableau vide si aucune maison trouvée
  } catch (err) {
    logToFile(`Erreur lors de la récupération des données dans get_list_houses :\n${err.message}`, "errors_bot.log");
    await db.close();
    throw err;
  }
}
