// Fichier annexe
import { get_ID_House } from "./config_house.js";
import { adressdb } from "./config.js";
import { logToFile } from "./log.js";

// Module nodejs et npm
import { v4 as uuidv4 } from "uuid";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function genereTokenApp(ServerID, AuthorID) {
  try {
    const id_house = await get_ID_House(ServerID);
    const uuid = uuidv4();

    const db = await open({
      filename: adressdb,
      driver: sqlite3.Database,
    });

    const insertQuery = `UPDATE Users SET uuidApp = ?, uuidAppUse = 0 WHERE DiscordID = ? AND ID_House = ?;`;
    await db.run(insertQuery, [uuid, AuthorID, id_house]);

    await db.close();
    return uuid;
  } catch (err) {
    console.error("Error in genereTokenApp:\n", err.message);
    logToFile("Error in genereTokenApp:\n", err.message, "errors_bot.log");
    return "";
  }
}
