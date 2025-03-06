// fichier annexe
import { siteInternet, store_app_android, store_app_ios } from "./config.js";

import { readFile } from "fs/promises";

export async function loadTranslations(language) {
  const data = await readFile(new URL(`./language_${language}.json`, import.meta.url), "utf8");
  return JSON.parse(data);
}

// WARNING : Traduction dans database.js (requete sql qui select directement en fonction de la langue)
