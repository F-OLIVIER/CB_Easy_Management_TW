// Fichier annexe

// Module nodejs et npm

// export async function tmpmsgreactgvg(BotReaction) {
//   var id_msg = await IDmsgGvG();
//   await client.channels.cache
//     .get(TODOBotReaction)
//     .messages.fetch(id_msg[0].IDMessageGvG)
//     .then((message) => message.delete());

//   const imageAttachment = new AttachmentBuilder("https://i43.servimg.com/u/f43/15/76/70/95/gvg10.jpg");
//   // Génére le message et l'envoi sur discord
//   const sendMessage = await BotReaction.send({
//     files: [imageAttachment],
//     embeds: [await tmpEmbedInscription()],
//   });

//   // Inscription du nouvelle ID du message dans la db
//   updateIdMessage(sendMessage.id);
// }

// option 0 = on, option 1 = off
// export function updateActivationBot(option, ID_Server) {
//   const db = new sqlite3.Database(adressdb);
//   const updateQuery = `UPDATE Houses SET Allumage = ? WHERE ID_Server = ?;`;
//   db.run(updateQuery, [option, ID_Server], function (error) {
//     if (error) throw error;
//   });
//   db.close();
// }

// export function botOn(message_id, ID_Server) {
//   const db = new sqlite3.Database(adressdb);
//   const selectQuery = `SELECT IDMessageGvG FROM Houses WHERE ID_Server = ?;`;

//   return new Promise((resolve, reject) => {
//     db.get(selectQuery, (err, row) => {
//       db.close();
//       if (err) {
//         console.log("err botOn : ", err);
//         reject(err);
//       } else {
//         if (row && row.IDMessageGvG === message_id) {
//           resolve(true);
//         } else {
//           resolve(false);
//         }
//       }
//     });
//   });
// }
