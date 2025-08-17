import { versionJS } from "./config.js";

export async function loadTranslate(langue) {
  try {
    const response = await fetch(`/json/translations_${langue}.json${versionJS}`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Erreur lors du chargement du fichier de langue JSON :", err);
    return null;
  }
}
