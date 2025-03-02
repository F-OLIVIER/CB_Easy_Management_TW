// // fichier annexe
// import { siteInternet } from "./config.js";
// import { msgreactgvg, tmpmsgreactgvg } from "./Embed_gvg.js";
// import { Resetsc } from "./FuncRaid.js";

// // module nodejs et npm
// import WebSocket from "ws";

// const wss = new WebSocket.Server({ port: 8081 });

// export function socket(BotReaction) {
//   wss.on("connection", function connection(ws) {
//     console.log("----------------- Socket connected -----------------");

//     ws.on("message", function incoming(message) {
//       try {
//         const jsonMessage = JSON.parse(message);

//         switch (jsonMessage.type) {
//           case "activatebot":
//             Resetsc();
//             msgreactgvg(BotReaction);
//             break;

//           case "desactivatebot":
//             tmpmsgreactgvg(BotReaction);
//             break;

//           case "newunit":
//             BotChan.send(
//               "<@&" +
//                 idRoleUser +
//                 ">\nL'unité " +
//                 jsonMessage.content +
//                 " a été ajoutée au bot, si vous avez déjà débloqué cet unité pensez à prévenir le pére blaise en mettant à jour votre caserne à l'adresse suivante :\n" +
//                 siteInternet
//             );
//             break;

//           case "newclass":
//             BotChan.send("<@&" + idRoleUser + ">\nLa classe d'arme " + jsonMessage.content + " a été ajoutée au bot, vous pouvez désormais la sélectionner sur le bot.");
//             break;

//           default:
//             console.log("Message reçu (non traité):", jsonMessage);
//             break;
//         }
//       } catch (error) {
//         console.error("Error parsing message as JSON:", error);
//       }
//     });

//     ws.on("close", function close() {
//       console.log("----------------- Socket disconnected -----------------");
//     });
//   });
// }
