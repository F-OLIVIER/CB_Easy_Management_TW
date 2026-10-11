import { computed, ref } from "vue";
import type { I18nText, Lang } from "../api/types";
import { STORAGE_KEYS } from "../config";
import fr from "./fr.json";
import en from "./en.json";

export type Translations = typeof fr;

const dictionaries: Record<Lang, Translations> = { fr, en };

export function isLang(value: unknown): value is Lang {
  return value === "fr" || value === "en";
}

function initialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEYS.lang);
  if (isLang(stored)) return stored;
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export const lang = ref<Lang>(initialLang());
document.documentElement.lang = lang.value;

/** Dictionnaire de la langue courante (réactif) */
export const t = computed<Translations>(() => dictionaries[lang.value]);

export function setLang(value: Lang): void {
  lang.value = value;
  localStorage.setItem(STORAGE_KEYS.lang, value);
  document.documentElement.lang = value;
}

/** Texte bilingue renvoyé par le backend → texte dans la langue courante */
export function tr(text: I18nText | null | undefined): string {
  return text ? (text[lang.value] ?? "") : "";
}

export const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "fr", label: "🇫🇷 Français" },
  { value: "en", label: "🇬🇧 English" },
];
