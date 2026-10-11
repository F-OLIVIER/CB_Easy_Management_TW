import DOMPurify from "dompurify";
import type { Lang } from "../api/types";

const pad = (value: number) => value.toString().padStart(2, "0");

/** "2025-04-12 18:30:00" → "12/04/2025 18h30" (fr) ou "2025/04/12 06:30 pm" (en) */
export function formatDate(dateStr: string, lang: Lang): string {
  const date = new Date(dateStr.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return dateStr;

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const minutes = pad(date.getMinutes());

  if (lang === "fr") return `${day}/${month}/${year} ${pad(date.getHours())}h${minutes}`;

  const hours = date.getHours() % 12 || 12;
  return `${year}/${month}/${day} ${pad(hours)}:${minutes} ${date.getHours() >= 12 ? "pm" : "am"}`;
}

// Les liens des contenus utilisateur s'ouvrent dans un nouvel onglet, sans referrer
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/** Nettoie le HTML saisi par les utilisateurs (forum) avant affichage */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    // style/class/id : un post ne doit pas pouvoir imiter l'interface de l'application (faux boutons, notifications…)
    FORBID_ATTR: ["style", "class", "id"],
    FORBID_TAGS: ["form", "input", "button", "textarea", "select", "style"],
  });
}

/** Retire le HTML pour tester si un contenu est vide */
export function isBlankHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, "").trim() === "" && !/<img/i.test(html);
}

export function stripTags(value: string): string {
  return value.replace(/[<>]/g, "");
}
