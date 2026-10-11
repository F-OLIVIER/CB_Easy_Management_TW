// Fichier annexe : commande admin "!weapon_logo" (image d'une arme de héros)
import { adressdb } from "./config.js";
import { logToFile } from "./log.js";

// Module nodejs et npm
import fs from "fs/promises";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Dossier lu par le site et la PWA : /img/weapon/<ClasseFR>.png
const WEAPON_IMG_DIR = path.resolve("../site/public/img/weapon");
const MAX_SIZE = 2 * 1024 * 1024; // 2 Mo
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function listWeapons() {
  const db = await open({ filename: adressdb, driver: sqlite3.Database, mode: sqlite3.OPEN_READONLY });
  try {
    return await db.all("SELECT ID, ClasseFR, ClasseEN FROM ListGameCharacter ORDER BY ID;");
  } finally {
    await db.close();
  }
}

// Recherche par ID, nom français ou nom anglais (sans tenir compte de la casse)
function findWeapon(weapons, query) {
  const search = query.trim().toLowerCase();
  return weapons.find((weapon) => String(weapon.ID) === search || weapon.ClasseFR.toLowerCase() === search || weapon.ClasseEN.toLowerCase() === search);
}

async function imageExists(weapon) {
  try {
    await fs.access(path.join(WEAPON_IMG_DIR, `${weapon.ClasseFR}.png`));
    return true;
  } catch {
    return false;
  }
}

/**
 * Commande "!weapon_logo [arme]" avec une image PNG en pièce jointe.
 * Sans argument : liste des armes et présence de leur image.
 * @returns {Promise<string>} réponse à envoyer à l'administrateur
 */
export async function weaponLogoCommand(message, query) {
  try {
    const weapons = await listWeapons();

    if (!query) {
      const lines = await Promise.all(weapons.map(async (weapon) => `${(await imageExists(weapon)) ? "✅" : "❌"} \`${weapon.ID}\` ${weapon.ClasseFR} / ${weapon.ClasseEN}`));
      return `liste des armes (✅ image présente, ❌ image absente) :\n${lines.join("\n")}\n\nUsage : \`!weapon_logo <nom ou ID de l'arme>\` avec une image PNG en pièce jointe.`;
    }

    const weapon = findWeapon(weapons, query);
    if (!weapon) {
      return `arme \`${query}\` introuvable. Tapez \`!weapon_logo\` pour la liste des armes.`;
    }

    // Le nom de l'arme devient le nom du fichier : refus de tout chemin
    if (/[\\/]|\.\./.test(weapon.ClasseFR)) {
      return `le nom de l'arme \`${weapon.ClasseFR}\` ne peut pas servir de nom de fichier.`;
    }

    const attachment = message.attachments.first();
    if (!attachment) {
      return `joignez l'image PNG de l'arme **${weapon.ClasseFR}** au message.`;
    }
    if (attachment.size > MAX_SIZE) {
      return `image trop lourde (2 Mo maximum).`;
    }

    // L'image doit être téléchargée avant la suppression du message (l'URL Discord devient invalide)
    const response = await fetch(attachment.url);
    if (!response.ok) {
      return `impossible de récupérer l'image (HTTP ${response.status}).`;
    }
    const image = Buffer.from(await response.arrayBuffer());
    if (image.length > MAX_SIZE || !image.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      return `l'image doit être un fichier PNG de 2 Mo maximum.`;
    }

    // Écriture atomique : le site ne sert jamais un fichier à moitié écrit
    const destination = path.join(WEAPON_IMG_DIR, `${weapon.ClasseFR}.png`);
    const temporary = `${destination}.tmp`;
    await fs.writeFile(temporary, image);
    await fs.rename(temporary, destination);

    logToFile(`Image de l'arme "${weapon.ClasseFR}" mise à jour par ${message.author.id}`);
    return `image de l'arme **${weapon.ClasseFR}** mise à jour.`;
  } catch (err) {
    logToFile(`Erreur commande !weapon_logo :\n${err.message}`, "errors_bot.log");
    return `erreur lors de la mise à jour de l'image de l'arme.`;
  }
}
